function T() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Il() {
  try {
    return T().getApiToken() || "";
  } catch {
    return "";
  }
}
function In(e) {
  return T().getApiUrl(e);
}
function $l(e) {
  const t = Il();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function zl(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, i) => {
    n[i] = r;
  }), n;
}
function ct(e, t) {
  const n = T(), r = zl(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...$l(), ...r }
  });
}
const Kt = /* @__PURE__ */ new Map(), Al = 15e3;
function Pl(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Rl(e, t, n) {
  return `${e}:${t}:${n}`;
}
function tn() {
  Kt.clear();
}
function pr(e) {
  for (const [t, n] of Kt)
    (e ? n.agentId === e : n.agentId) && Kt.delete(t);
}
async function ce(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...i } = t || {}, a = Pl(
    i.headers
  ), l = Rl(n, e, a);
  if (n !== "GET" && (a ? pr(a) : tn()), n === "GET" && !r) {
    const d = Kt.get(l);
    if (d && Date.now() - d.ts < Al)
      return d.data;
  }
  const s = await ct(e, i);
  if (!s.ok) {
    const d = await s.text().catch(() => "");
    throw new Error(d || `HTTP ${s.status}`);
  }
  if (s.status === 204) return null;
  const o = await s.json();
  return n === "GET" && Kt.set(l, {
    data: o,
    ts: Date.now(),
    agentId: a || void 0
  }), o;
}
const Ke = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function $n(e, t) {
  const n = T();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function zn({
  title: e,
  subtitle: t,
  extra: n
}) {
  const r = T().React, { Space: i } = T().antd;
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
async function An() {
  const e = await ce("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function fr(e) {
  return ce(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function Pn(e) {
  return await ce(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Rn(e = !1) {
  return await ce(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Ol(e) {
  const t = await ce(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Ml() {
  return (await ce(
    "/skills/workspaces"
  ) || []).map((t) => ({
    agent_id: t.agent_id,
    agent_name: t.agent_name || "",
    // Current hosts return skill_names. Keep the legacy fallback so the
    // plugin remains compatible with older QwenPaw releases.
    skill_names: Array.isArray(t.skill_names) ? t.skill_names : Array.isArray(t.skills) ? t.skills.map((n) => n.name) : []
  }));
}
function At(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function ei(e) {
  var n;
  const t = [];
  for (const r of e) {
    if (r.enabled === !1) continue;
    const i = (n = r.description) == null ? void 0 : n.trim();
    if (!i) continue;
    const a = (r.name || i).length > 20 ? (r.name || i).substring(0, 18) + "…" : r.name || i;
    let l = i;
    if (l = l.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(l) ? l = `请${l}` : /^(a |an |the )/i.test(l) ? l = `Help me with ${l}` : /[。？！.?!]$/.test(l) || (l = `帮我${l}`), l.length > 80 && (l = l.substring(0, 77) + "..."), t.push({ label: a, value: l }), t.length >= 4) break;
  }
  return t;
}
async function Ll(e) {
  return await ce("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function kt(e, t, n) {
  return ce(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function Bl(e, t, n, r) {
  return ce("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const jl = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function Ul(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (jl.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Nl(e, t) {
  const n = await fr(e);
  n.system_prompt_files = t, await ce(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function gr(e, t) {
  await ce("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function ti(e, t) {
  await ce(
    At(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function yr(e, t) {
  await ce(At(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function Dl(e, t) {
  return ce(At(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Fl(e, t) {
  return ce(At(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Gl(e, t) {
  return ce(At(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function hr(e) {
  return await ce("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ni(e, t) {
  await ce(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Er(e, t) {
  return ce("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Wl(e, t) {
  return ce(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function ri(e, t) {
  await ce(
    At(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Hl(e) {
  await ce(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function ql(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), i = parseInt(n[2] || "0", 10), a = parseInt(n[3] || "0", 10), l = r * 60 + i + Math.round(a / 60);
  return l <= 0 ? { number: 6, unit: "h" } : l >= 60 && l % 60 === 0 ? { number: l / 60, unit: "h" } : { number: l, unit: "m" };
}
function Vl(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Jl(e) {
  return ce("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Kl(e, t) {
  return ce("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Xl(e) {
  await ce("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Yl(e) {
  return ce("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Ql(e, t) {
  return ce("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Zl(e) {
  return (await ce("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function eo(e, t) {
  await ce("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function to() {
  return (await ce("/config/user-timezone")).timezone || "UTC";
}
async function no(e) {
  await ce("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function ro(e) {
  return await ce("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const ta = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function ao({
  items: e,
  max: t = 5,
  color: n = "blue",
  emptyText: r = "无"
}) {
  const i = T().React, { Tag: a } = T().antd;
  return !e || e.length === 0 ? i.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    r
  ) : i.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (l, s) => i.createElement(
        a,
        { key: s, color: n, style: { fontSize: 11, marginRight: 0 } },
        l
      )
    ),
    e.length > t ? i.createElement(
      a,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function ai({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: i,
  onInstall: a
}) {
  const l = T().React, { useState: s, useEffect: o, useMemo: d } = l, { Modal: c, Button: u, Empty: m, Spin: p, Input: w, Tag: g, Tooltip: y, Typography: f } = T().antd, { CheckOutlined: v, SearchOutlined: S } = T().antdIcons || {}, { Text: b } = f, [x, R] = s([]), [J, P] = s("");
  o(() => {
    e && (R([]), P(""));
  }, [e]);
  const j = d(() => {
    if (!J.trim()) return n;
    const $ = J.toLowerCase();
    return n.filter(
      (A) => {
        var M, _;
        return A.name.toLowerCase().includes($) || ((M = A.description) == null ? void 0 : M.toLowerCase().includes($)) || ((_ = A.tags) == null ? void 0 : _.some((O) => O.toLowerCase().includes($)));
      }
    );
  }, [n, J]), X = j.filter(
    ($) => !r.includes($.name)
  ), q = ($) => {
    R(
      (A) => A.includes($) ? A.filter((M) => M !== $) : [...A, $]
    );
  }, U = async () => {
    x.length !== 0 && (await a(x), R([]));
  };
  return l.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: l.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        l.createElement(
          b,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${x.length} 个技能`
        ),
        l.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          l.createElement(u, { onClick: t }, "取消"),
          l.createElement(
            u,
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
    l.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      l.createElement(w, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: S ? l.createElement(S) : void 0,
        value: J,
        onChange: ($) => P($.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      l.createElement(
        u,
        {
          size: "small",
          type: "primary",
          onClick: () => R(X.map(($) => $.name))
        },
        "全选"
      ),
      l.createElement(
        u,
        {
          size: "small",
          onClick: () => R([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    i ? l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(p, { size: "large" })
    ) : j.length === 0 ? l.createElement(m, {
      description: J ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(
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
      ...j.map(($) => {
        const A = x.includes($.name), M = r.includes($.name);
        return l.createElement(
          "div",
          {
            key: $.name,
            onClick: () => !M && q($.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${A ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: M ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: A ? "rgba(0, 114, 245, 0.06)" : M ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: M ? 0.5 : 1,
              minHeight: 64
            }
          },
          A ? l.createElement(
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
            v ? l.createElement(v) : "✓"
          ) : null,
          M ? l.createElement(
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
          l.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: M || A ? 24 : 0
              }
            },
            l.createElement(
              "span",
              { style: { fontSize: 16 } },
              $.emoji || "⚡"
            ),
            l.createElement(
              y,
              { title: $.name },
              l.createElement(
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
                $.name
              )
            )
          ),
          $.description ? l.createElement(
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
            $.description
          ) : null,
          $.tags && $.tags.length > 0 ? l.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...$.tags.slice(0, 2).map(
              (_, O) => l.createElement(
                g,
                {
                  key: O,
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
function ii({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n
}) {
  const r = T().React, { useState: i, useEffect: a, useCallback: l, useRef: s } = r, {
    List: o,
    Tag: d,
    Switch: c,
    Button: u,
    Modal: m,
    Input: p,
    Spin: w,
    Empty: g,
    message: y,
    Typography: f,
    Segmented: v,
    Alert: S
  } = T().antd, { FileTextOutlined: b, PlusOutlined: x, EditOutlined: R, ReloadOutlined: J } = T().antdIcons || {}, { Text: P } = f, [j, X] = i([]), [q, U] = i(!0), [$, A] = i(
    t || []
  ), [M, _] = i(!1), [O, D] = i(null), [Y, z] = i(""), [C, te] = i(""), [re, F] = i(!1), [L, le] = i("source"), ie = s(0), W = l(async () => {
    const N = ++ie.current;
    U(!0);
    try {
      const k = await Ll(e);
      N === ie.current && X(k);
    } catch (k) {
      N === ie.current && (y.error(k.message || "加载工作区文档失败"), X([]));
    } finally {
      N === ie.current && U(!1);
    }
  }, [e]);
  a(() => {
    W();
  }, [W]), a(() => {
    A(t || []);
  }, [t]);
  const pe = async (N, k) => {
    const oe = new Set($);
    if (k)
      oe.add(N);
    else {
      if (ta.includes(N) && N === "AGENTS.md") {
        y.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      oe.delete(N);
    }
    const he = Array.from(oe);
    A(he);
    try {
      await Nl(e, he), y.success(k ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (xe) {
      y.error(xe.message || "更新失败"), A(t || []);
    }
  }, ae = async (N) => {
    try {
      const k = await ce(
        `/workspace/files/${encodeURIComponent(N)}`,
        { headers: { "X-Agent-Id": e } }
      );
      D(N), z(k.content || ""), le("source"), _(!0);
    } catch (k) {
      y.error(k.message || "读取文件失败");
    }
  }, G = () => {
    D(null), z(""), te(""), le("source"), _(!0);
  }, ue = async () => {
    let N;
    try {
      N = Ul(O || C);
    } catch (k) {
      y.warning(k.message || "文件名无效");
      return;
    }
    if (!Y.trim()) {
      y.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(Y).length > 1024 * 1024) {
      y.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    F(!0);
    try {
      if (O)
        await kt(e, N, Y);
      else {
        const k = await Bl(
          e,
          N,
          Y,
          !0
        );
        A(k.system_prompt_files);
      }
      y.success("保存成功"), _(!1), W(), n();
    } catch (k) {
      const oe = k != null && k.message ? `：${k.message}` : "";
      y.error(
        O ? (k == null ? void 0 : k.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${oe}`
      );
    } finally {
      F(!1);
    }
  };
  return q ? r.createElement(
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
        b ? r.createElement(b, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        r.createElement(
          P,
          { strong: !0 },
          `工作区文档 (${j.length})`
        ),
        r.createElement(
          P,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${$.length} 个已挂载到系统提示`
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          u,
          {
            size: "small",
            icon: J ? r.createElement(J) : void 0,
            onClick: W
          },
          "刷新"
        ),
        r.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: x ? r.createElement(x) : void 0,
            onClick: G
          },
          "新建 Markdown 文档"
        )
      )
    ),
    j.length === 0 ? r.createElement(g, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(o, {
      dataSource: j,
      renderItem: (N) => {
        const k = $.includes(N.filename), oe = ta.includes(N.filename);
        return r.createElement(
          o.Item,
          {
            actions: [
              r.createElement(
                u,
                {
                  type: "link",
                  size: "small",
                  icon: R ? r.createElement(R) : void 0,
                  onClick: () => ae(N.filename)
                },
                "编辑"
              )
            ]
          },
          r.createElement(o.Item.Meta, {
            avatar: r.createElement(b, {
              style: {
                fontSize: 20,
                color: k ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
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
              r.createElement(P, null, N.filename),
              oe ? r.createElement(
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
              `${(N.size / 1024).toFixed(1)} KB · 修改于 ${new Date(N.modified_time).toLocaleString()}`
            )
          }),
          r.createElement(c, {
            checked: k,
            size: "small",
            onChange: (he) => pe(N.filename, he)
          })
        );
      }
    }),
    // Edit/New file modal
    r.createElement(
      m,
      {
        open: M,
        onCancel: () => _(!1),
        title: O ? `编辑 ${O}` : "新建 Markdown 文档",
        width: 700,
        onOk: ue,
        confirmLoading: re,
        okText: "保存"
      },
      O ? null : r.createElement(
        "div",
        { style: { marginBottom: 12 } },
        r.createElement(p, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: C,
          onChange: (N) => te(N.target.value),
          addonAfter: C.endsWith(".md") ? "" : ".md"
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
        r.createElement(v, {
          size: "small",
          value: L,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (N) => le(N)
        }),
        r.createElement(
          P,
          { type: "secondary", style: { fontSize: 12 } },
          `${Y.length} 字符 · 约 ${Math.ceil(Y.length / 4)} tokens · ${O && $.includes(O) ? "已挂载" : O ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      Y.trim() ? null : r.createElement(S, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      L === "source" ? r.createElement(p.TextArea, {
        value: Y,
        onChange: (N) => z(N.target.value),
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
        $n(Y, r)
      )
    )
  );
}
function io({
  skills: e,
  agentId: t
}) {
  const n = T().React, { useMemo: r } = n, {
    List: i,
    Tag: a,
    Typography: l,
    Empty: s,
    Button: o,
    message: d
  } = T().antd, { ThunderboltOutlined: c, CopyOutlined: u } = T().antdIcons || {}, { Text: m } = l, p = r(() => ei(e), [e]), w = (y) => {
    try {
      const f = T();
      f.setSelectedAgent && f.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", y.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, g = (y) => {
    var f;
    (f = navigator.clipboard) == null || f.writeText(y.value).then(() => {
      d.success("已复制到剪贴板");
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
      c ? n.createElement(c, {
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
    n.createElement(i, {
      dataSource: p,
      renderItem: (y, f) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              o,
              {
                type: "link",
                size: "small",
                icon: u ? n.createElement(u) : void 0,
                onClick: () => g(y)
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
const Tt = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, li = { marginBottom: 16 }, oi = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, mt = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, si = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function lo({ agentId: e }) {
  const t = T().React, { useState: n, useEffect: r, useCallback: i } = t, {
    Switch: a,
    InputNumber: l,
    Select: s,
    Button: o,
    Spin: d,
    Space: c,
    Typography: u,
    message: m
  } = T().antd, { PlayCircleOutlined: p, SaveOutlined: w } = T().antdIcons || {}, { Text: g } = u, [y, f] = n(!0), [v, S] = n(!1), [b, x] = n(!1), [R, J] = n(!1), [P, j] = n(6), [X, q] = n("h"), [U, $] = n("main"), [A, M] = n(300), [_, O] = n(!1), [D, Y] = n("08:00"), [z, C] = n("22:00"), te = i(async () => {
    var W, pe;
    f(!0);
    try {
      const ae = await Jl(e), G = ql(ae.every ?? "6h");
      J(ae.enabled ?? !1), j(G.number), q(G.unit), $(ae.target ?? "main"), M(ae.timeoutSeconds ?? 300), O(!!ae.activeHours), Y(((W = ae.activeHours) == null ? void 0 : W.start) ?? "08:00"), C(((pe = ae.activeHours) == null ? void 0 : pe.end) ?? "22:00");
    } catch (ae) {
      m.error(ae.message || "加载心跳配置失败");
    } finally {
      f(!1);
    }
  }, [e]);
  r(() => {
    te();
  }, [te]);
  const re = async () => {
    S(!0);
    try {
      await Kl(e, {
        enabled: R,
        every: Vl({ number: P, unit: X }),
        target: U,
        timeoutSeconds: A,
        activeHours: _ && D && z ? { start: D, end: z } : void 0
      }), m.success("心跳配置已保存");
    } catch (W) {
      m.error(W.message || "保存心跳配置失败");
    } finally {
      S(!1);
    }
  }, F = async () => {
    x(!0);
    try {
      await Xl(e), m.success("已触发心跳检查");
    } catch (W) {
      m.error(W.message || "触发心跳失败");
    } finally {
      x(!1);
    }
  };
  if (y)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(d, { size: "large" })
    );
  const L = (W, pe, ae) => t.createElement(
    "div",
    { style: li },
    t.createElement("div", { style: Tt }, W),
    pe,
    ae ? t.createElement(
      g,
      { type: "secondary", style: si },
      ae
    ) : null
  ), le = (W, pe, ae, G) => t.createElement(
    "div",
    { style: oi },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Tt }, W),
      pe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Tt }, ae),
      G
    )
  ), { Divider: ie } = T().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: mt }, "基本设置"),
    L(
      "启用心跳",
      t.createElement(a, {
        checked: R,
        onChange: (W) => J(W)
      }),
      R ? "已启用，专家将定期自检" : "已停用"
    ),
    le(
      "检查频率",
      t.createElement(
        c,
        null,
        t.createElement(l, {
          min: 1,
          value: P,
          onChange: (W) => j(W ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(s, {
          value: X,
          onChange: (W) => q(W),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(s, {
        value: U,
        onChange: (W) => $(W),
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
      t.createElement(l, {
        min: 1,
        max: 3600,
        value: A,
        onChange: (W) => M(W ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(ie, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: mt }, "活跃时段"),
    L(
      "启用活跃时段限制",
      t.createElement(a, {
        checked: _,
        onChange: (W) => O(W)
      }),
      "仅在指定时段内触发心跳"
    ),
    _ ? le(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: D,
        onChange: (W) => Y(W.target.value),
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
        value: z,
        onChange: (W) => C(W.target.value),
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
          loading: v,
          onClick: re,
          style: Ke
        },
        "保存配置"
      ),
      t.createElement(
        o,
        {
          icon: p ? t.createElement(p) : void 0,
          loading: b,
          onClick: F
        },
        "立即执行"
      )
    )
  );
}
function oo({
  agentId: e,
  onRefresh: t
}) {
  const n = T().React, { useState: r, useEffect: i, useCallback: a } = n, {
    List: l,
    Tag: s,
    Switch: o,
    Button: d,
    Empty: c,
    Spin: u,
    Typography: m,
    message: p
  } = T().antd, { PlusOutlined: w, ReloadOutlined: g, DeleteOutlined: y } = T().antdIcons || {}, { Text: f, Paragraph: v } = m, [S, b] = r([]), [x, R] = r(!0), [J, P] = r(!1), [j, X] = r([]), [q, U] = r(!1), $ = a(async () => {
    R(!0);
    try {
      const Y = await Pn(e);
      b(Y);
    } catch (Y) {
      p.error(Y.message || "加载技能失败"), b([]);
    } finally {
      R(!1);
    }
  }, [e]);
  i(() => {
    $();
  }, [$]);
  const A = async () => {
    P(!0), U(!0);
    try {
      const Y = await Rn(!0);
      X(Y);
    } catch (Y) {
      p.error(Y.message || "加载技能池失败");
    } finally {
      U(!1);
    }
  }, M = async (Y) => {
    let z = 0, C = 0;
    for (const te of Y)
      try {
        await gr(e, te), z++;
      } catch {
        C++;
      }
    z > 0 ? (p.success(
      `成功添加 ${z} 个技能${C > 0 ? `，${C} 个失败` : ""}`
    ), $(), t()) : C > 0 && p.error("添加技能失败"), P(!1);
  }, _ = async (Y, z) => {
    try {
      z ? await ti(e, Y.name) : await ri(e, Y.name), p.success(z ? "已启用" : "已停用"), $(), t();
    } catch (C) {
      p.error(C.message || "操作失败");
    }
  }, O = async (Y) => {
    try {
      await yr(e, Y), p.success(`技能「${Y}」已移除`), $(), t();
    } catch (z) {
      p.error(z.message || "移除技能失败");
    }
  };
  if (x)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(u, { size: "large" })
    );
  const D = S.filter((Y) => Y.enabled !== !1);
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
        `技能列表 (${S.length}，已启用 ${D.length})`
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
              tn(), $();
            }
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: w ? n.createElement(w) : void 0,
            onClick: A,
            style: Ke
          },
          "从技能池添加"
        )
      )
    ),
    S.length === 0 ? n.createElement(c, {
      description: "该专家暂无技能",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(l, {
      dataSource: S,
      renderItem: (Y) => n.createElement(
        l.Item,
        {
          actions: [
            n.createElement(o, {
              key: "toggle",
              size: "small",
              checked: Y.enabled !== !1,
              onChange: (z) => _(Y, z)
            }),
            n.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: y ? n.createElement(y) : void 0,
                onClick: () => O(Y.name)
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
              s,
              { style: { fontSize: 10 } },
              `v${Y.version_text}`
            ) : null
          ),
          Y.description ? n.createElement(
            v,
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
    n.createElement(ai, {
      open: J,
      onClose: () => P(!1),
      poolSkills: j,
      installedSkillNames: S.map((Y) => Y.name),
      loading: q,
      onInstall: M
    })
  );
}
function so({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = T().React, { useState: i, useEffect: a, useCallback: l } = r, {
    List: s,
    Tag: o,
    Button: d,
    Empty: c,
    Spin: u,
    Modal: m,
    Input: p,
    Typography: w,
    message: g
  } = T().antd, { PlusOutlined: y, ReloadOutlined: f, DeleteOutlined: v } = T().antdIcons || {}, { Text: S, Paragraph: b } = w, { TextArea: x } = p, [R, J] = i([]), [P, j] = i(!0), [X, q] = i(!1), [U, $] = i(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [A, M] = i(!1), _ = l(async () => {
    j(!0);
    try {
      const z = await hr(e);
      J(z);
    } catch (z) {
      g.error(z.message || "加载 MCP 失败"), J([]);
    } finally {
      j(!1);
    }
  }, [e]);
  a(() => {
    _();
  }, [_]), a(() => {
    n && _();
  }, [n, _]);
  const O = async (z) => {
    try {
      await Wl(e, z), g.success("已切换 MCP 状态"), _(), t();
    } catch (C) {
      g.error(C.message || "切换失败");
    }
  }, D = async (z) => {
    try {
      await ni(e, z), g.success(`MCP「${z}」已移除`), _(), t();
    } catch (C) {
      g.error(C.message || "移除 MCP 失败");
    }
  }, Y = async () => {
    M(!0);
    try {
      const z = JSON.parse(U), C = z.mcpServers || z, te = Object.entries(C);
      if (te.length === 0) {
        g.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [re, F] of te) {
        const L = F, le = L.url ? "streamable_http" : "stdio";
        await Er(e, {
          client_key: re,
          client: {
            name: L.name || re,
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
      g.success("MCP 客户端已创建"), q(!1), _(), t();
    } catch (z) {
      z instanceof SyntaxError ? g.error("JSON 格式错误：" + z.message) : g.error(z.message || "创建 MCP 失败");
    } finally {
      M(!1);
    }
  };
  return P ? r.createElement(
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
      r.createElement(S, { strong: !0 }, `MCP 客户端 (${R.length})`),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          d,
          {
            size: "small",
            icon: f ? r.createElement(f) : void 0,
            onClick: () => {
              tn(), _();
            }
          },
          "刷新"
        ),
        r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: y ? r.createElement(y) : void 0,
            onClick: () => q(!0),
            style: Ke
          },
          "添加 MCP"
        )
      )
    ),
    R.length === 0 ? r.createElement(c, {
      description: "该专家暂无 MCP 客户端",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(s, {
      dataSource: R,
      renderItem: (z) => r.createElement(
        s.Item,
        {
          actions: [
            r.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => O(z.key)
              },
              z.enabled ? "停用" : "启用"
            ),
            r.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: v ? r.createElement(v) : void 0,
                onClick: () => D(z.key)
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
            r.createElement(S, { strong: !0 }, z.name || z.key),
            r.createElement(
              o,
              {
                color: z.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              z.enabled ? "启用" : "停用"
            ),
            r.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              z.transport
            )
          ),
          z.description ? r.createElement(
            b,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            z.description
          ) : null,
          z.tools && z.tools.length > 0 ? r.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${z.tools.length} 个工具`
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
        onCancel: () => q(!1),
        onOk: Y,
        confirmLoading: A,
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
        onChange: (z) => $(z.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function co({ agentId: e }) {
  const t = T().React, { useState: n, useEffect: r, useCallback: i, useRef: a } = t, {
    Card: l,
    InputNumber: s,
    Input: o,
    Select: d,
    Switch: c,
    Button: u,
    Spin: m,
    Space: p,
    Typography: w,
    Divider: g,
    message: y
  } = T().antd, { SaveOutlined: f } = T().antdIcons || {}, { Text: v } = w, [S, b] = n(!0), [x, R] = n(!1), J = a(null), [P, j] = n(60), [X, q] = n(""), [U, $] = n(!0), [A, M] = n(30), [_, O] = n("zh"), [D, Y] = n("UTC"), [z, C] = n(!0), [te, re] = n(100), [F, L] = n(!0), [le, ie] = n(3), [W, pe] = n(1), [ae, G] = n(!0), [ue, N] = n(3), [k, oe] = n(2), [he, xe] = n(60), [ze, Se] = n(1), [me, Ie] = n(0), [Pe, Q] = n(1), [ye, ve] = n(0), [ke, h] = n(30), [V, I] = n(50), [se, ge] = n("light"), [Ee, $e] = n("scroll"), [Le, Ge] = n("remelight"), [rt, Ue] = n("AUTO"), ot = i(async () => {
    var ne, Oe, Ce, Fe, Qe, at;
    b(!0);
    try {
      const [Ae, He, qe] = await Promise.all([
        Yl(e),
        Zl(e).catch(() => "zh"),
        to().catch(() => "UTC")
      ]);
      J.current = Ae, j(Ae.shell_command_timeout ?? 60), q(Ae.shell_command_executable ?? "");
      const st = Ae.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      $(st.enabled ?? !0), M(st.timeout_seconds ?? 30), O(He), Y(qe);
      const We = Ae.loop ?? {};
      C(((ne = We.iteration) == null ? void 0 : ne.enabled) ?? !0), re(((Oe = We.iteration) == null ? void 0 : Oe.max_iterations) ?? Ae.max_iters ?? 100), L(((Ce = We.doom_loop) == null ? void 0 : Ce.enabled) ?? !0), ie(((Fe = We.doom_loop) == null ? void 0 : Fe.window_size) ?? 3), pe(((Qe = We.doom_loop) == null ? void 0 : Qe.similarity_threshold) ?? 1), G(Ae.llm_retry_enabled ?? !0), N(Ae.llm_max_retries ?? 3), oe(Ae.llm_backoff_base ?? 2), xe(Ae.llm_backoff_cap ?? 60), Se(Ae.llm_max_concurrent ?? 1), Ie(Ae.llm_max_qpm ?? 0), Q(Ae.llm_rate_limit_pause ?? 1), ve(Ae.llm_rate_limit_jitter ?? 0), h(Ae.llm_acquire_timeout ?? 30), I(Ae.history_max_length ?? 50), ge(Ae.context_manager_backend ?? "light"), $e(((at = Ae.light_context_config) == null ? void 0 : at.strategy) ?? "scroll"), Ge(Ae.memory_manager_backend ?? "remelight"), Ue(Ae.approval_level ?? "AUTO");
    } catch (Ae) {
      y.error(Ae.message || "加载运行配置失败");
    } finally {
      b(!1);
    }
  }, [e]);
  r(() => {
    ot();
  }, [ot]);
  const Ye = async () => {
    var Oe, Ce;
    const ne = J.current;
    if (ne) {
      R(!0);
      try {
        const Fe = {
          ...ne,
          max_iters: te,
          loop: {
            ...ne.loop ?? {},
            iteration: { enabled: z, max_iterations: te },
            doom_loop: {
              enabled: F,
              window_size: le,
              similarity_threshold: W,
              stages: ((Ce = (Oe = ne.loop) == null ? void 0 : Oe.doom_loop) == null ? void 0 : Ce.stages) ?? []
            }
          },
          shell_command_timeout: P,
          shell_command_executable: X,
          auto_title_config: {
            enabled: U,
            timeout_seconds: A
          },
          llm_retry_enabled: ae,
          llm_max_retries: ue,
          llm_backoff_base: k,
          llm_backoff_cap: he,
          llm_max_concurrent: ze,
          llm_max_qpm: me,
          llm_rate_limit_pause: Pe,
          llm_rate_limit_jitter: ye,
          llm_acquire_timeout: ke,
          history_max_length: V,
          context_manager_backend: se,
          light_context_config: {
            ...ne.light_context_config ?? {},
            strategy: Ee
          },
          memory_manager_backend: Le,
          approval_level: rt
        };
        await Ql(e, Fe), J.current = Fe, _ && await eo(e, _).catch(() => {
        }), D && await no(D).catch(() => {
        }), y.success("运行配置已保存");
      } catch (Fe) {
        y.error(Fe.message || "保存运行配置失败");
      } finally {
        R(!1);
      }
    }
  };
  if (S)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(m, { size: "large" })
    );
  const B = (ne, Oe, Ce) => t.createElement(
    "div",
    { style: li },
    t.createElement("div", { style: Tt }, ne),
    Oe,
    Ce ? t.createElement(
      v,
      { type: "secondary", style: si },
      Ce
    ) : null
  ), de = (ne, Oe, Ce, Fe) => t.createElement(
    "div",
    { style: oi },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Tt }, ne),
      Oe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Tt }, Ce),
      Fe
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: mt },
      "基础设置"
    ),
    de(
      "Shell 命令超时 (秒)",
      t.createElement(s, {
        min: 1,
        value: P,
        onChange: (ne) => j(ne ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(o, {
        value: X,
        onChange: (ne) => q(ne.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    de(
      "语言",
      t.createElement(d, {
        value: _,
        onChange: (ne) => O(ne),
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
        onChange: (ne) => Y(ne),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (ne, Oe) => {
          var Ce;
          return (((Ce = Oe == null ? void 0 : Oe.label) == null ? void 0 : Ce.toString()) || "").toLowerCase().includes(ne.toLowerCase());
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
        ].map((ne) => ({ value: ne, label: ne }))
      })
    ),
    de(
      "自动生成会话标题",
      t.createElement(p, null, t.createElement(c, {
        checked: U,
        onChange: (ne) => $(ne)
      })),
      "标题生成超时 (秒)",
      t.createElement(s, {
        min: 5,
        value: A,
        onChange: (ne) => M(ne ?? 30),
        style: { width: "100%" },
        disabled: !U
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: mt }, "审批级别"),
    B(
      "工具执行审批",
      t.createElement(d, {
        value: rt,
        onChange: (ne) => Ue(ne),
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
    t.createElement("div", { style: mt }, "迭代与循环"),
    B(
      "启用迭代限制",
      t.createElement(c, {
        checked: z,
        onChange: (ne) => C(ne)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    z ? B(
      "最大迭代次数",
      t.createElement(s, {
        min: 1,
        max: 500,
        value: te,
        onChange: (ne) => re(ne ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    B(
      "启用重复循环保护",
      t.createElement(c, {
        checked: F,
        onChange: (ne) => L(ne)
      }),
      "检测并阻止重复操作循环"
    ),
    F ? de(
      "检测窗口大小",
      t.createElement(s, {
        min: 2,
        max: 20,
        value: le,
        onChange: (ne) => ie(ne ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(s, {
        min: 0,
        max: 1,
        step: 0.05,
        value: W,
        onChange: (ne) => pe(ne ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: mt }, "LLM 重试"),
    B(
      "启用 LLM 重试",
      t.createElement(c, {
        checked: ae,
        onChange: (ne) => G(ne)
      })
    ),
    de(
      "最大重试次数",
      t.createElement(s, {
        min: 1,
        value: ue,
        onChange: (ne) => N(ne ?? 3),
        style: { width: "100%" },
        disabled: !ae
      }),
      "退避基数 (秒)",
      t.createElement(s, {
        min: 0.1,
        step: 0.1,
        value: k,
        onChange: (ne) => oe(ne ?? 2),
        style: { width: "100%" },
        disabled: !ae
      })
    ),
    B(
      "退避上限 (秒)",
      t.createElement(s, {
        min: 0.5,
        step: 0.5,
        value: he,
        onChange: (ne) => xe(ne ?? 60),
        style: { width: 200 },
        disabled: !ae
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: mt }, "LLM 限流"),
    de(
      "最大并发数",
      t.createElement(s, {
        min: 1,
        value: ze,
        onChange: (ne) => Se(ne ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(s, {
        min: 0,
        step: 10,
        value: me,
        onChange: (ne) => Ie(ne ?? 0),
        style: { width: "100%" }
      })
    ),
    de(
      "限流暂停时间 (秒)",
      t.createElement(s, {
        min: 1,
        step: 0.5,
        value: Pe,
        onChange: (ne) => Q(ne ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(s, {
        min: 0,
        step: 0.5,
        value: ye,
        onChange: (ne) => ve(ne ?? 0),
        style: { width: "100%" }
      })
    ),
    B(
      "获取超时 (秒)",
      t.createElement(s, {
        min: 10,
        step: 10,
        value: ke,
        onChange: (ne) => h(ne ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: mt }, "上下文与记忆"),
    de(
      "上下文管理后端",
      t.createElement(d, {
        value: se,
        onChange: (ne) => ge(ne),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(d, {
        value: Ee,
        onChange: (ne) => $e(ne),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    de(
      "记忆管理后端",
      t.createElement(d, {
        value: Le,
        onChange: (ne) => Ge(ne),
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
        value: V,
        onChange: (ne) => I(ne ?? 50),
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
          onClick: Ye,
          style: Ke
        },
        "保存运行配置"
      )
    )
  );
}
function uo({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const i = T().React, { useState: a, useEffect: l, useCallback: s } = i, { Modal: o, Tabs: d, Spin: c, Typography: u } = T().antd, { SettingOutlined: m } = T().antdIcons || {}, { Text: p } = u, [w, g] = a([]), [y, f] = a(!1), [v, S] = a("heartbeat"), b = s(async () => {
    if (e) {
      f(!0);
      try {
        const P = await ro(e.agent.id);
        g(P);
      } catch {
        g([]);
      } finally {
        f(!1);
      }
    }
  }, [e]);
  if (l(() => {
    t && e && b();
  }, [t, e, b]), !e) return null;
  const { agent: x } = e, R = () => {
    b(), r();
  }, J = [
    {
      key: "heartbeat",
      label: "心跳",
      children: i.createElement(lo, {
        agentId: x.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: y ? i.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        i.createElement(c, { size: "large" })
      ) : i.createElement(ii, {
        agentId: x.id,
        systemPromptFiles: w,
        onRefresh: R
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((P) => P.enabled !== !1).length})`,
      children: i.createElement(oo, {
        agentId: x.id,
        onRefresh: r
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: i.createElement(so, {
        agentId: x.id,
        onRefresh: r,
        isActive: v === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: i.createElement(co, {
        agentId: x.id
      })
    }
  ];
  return i.createElement(
    o,
    {
      open: t,
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        m ? i.createElement(m, { style: { fontSize: 18 } }) : null,
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
      items: J,
      activeKey: v,
      onChange: (P) => S(P),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const ci = [
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
], mo = ci;
function na(e) {
  return In(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function ra(e) {
  const t = e.map(encodeURIComponent).join(",");
  return In(`/ugsci/avatar/team/${t}`);
}
function dt({
  name: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = T().React, [i, a] = r.useState(0), l = i === 0 ? na(e) : `${na(e)}?_r=${i}`;
  return r.createElement("img", {
    src: l,
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
function br({
  members: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = T().React, [i, a] = r.useState(0);
  if (!e || e.length === 0)
    return r.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const l = e.slice(0, 5), s = i === 0 ? ra(l) : `${ra(l)}?_r=${i}`;
  return r.createElement("img", {
    src: s,
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
async function aa(e) {
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
function po(e) {
  return e.slice(0, 2).join("、") + (e.length > 2 ? ` 等 ${e.length} 项` : "");
}
function fo({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r
}) {
  var b, x;
  const i = T().React, { Card: a, Badge: l, Button: s, Tooltip: o } = T().antd, { ThunderboltOutlined: d, SettingOutlined: c } = T().antdIcons || {}, { agent: u, skills: m } = e, p = u.enabled, w = m.filter((R) => R.enabled !== !1), g = ci.find(
    (R) => R.id === u.id || R.name === u.name
  ), y = Array.from(
    new Set(
      (b = g == null ? void 0 : g.tags) != null && b.length ? g.tags : w.flatMap((R) => R.tags || [])
    )
  ).slice(0, 3), f = u.managed_by_app ? "应用专属专家" : (g == null ? void 0 : g.category) || (u.id === "default" ? "通用助手" : "自定义专家"), v = ((x = u.description) == null ? void 0 : x.trim()) || "", S = w.map((R) => R.name);
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
        i.createElement(dt, { name: u.name, size: 42 }),
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
            u.name
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
        i.createElement(l, {
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
      y.length > 0 ? i.createElement(ao, {
        items: y,
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
        S.length ? po(S) : "尚未配置技能，可在专家配置中补充"
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
          title: v
        },
        v ? $n(v, i) : "暂无描述"
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
        o,
        { title: "配置专家", placement: "top" },
        i.createElement(s, {
          type: "text",
          size: "small",
          "aria-label": `配置 ${u.name}`,
          icon: c ? i.createElement(c, {
            style: {
              fontSize: 16,
              color: "var(--ant-color-text-tertiary, #8c8c8c)"
            }
          }) : void 0,
          onClick: (R) => {
            R.stopPropagation(), r && r();
          }
        })
      ),
      i.createElement(
        s,
        {
          type: "link",
          size: "small",
          onClick: (R) => {
            R.stopPropagation(), t();
          }
        },
        "查看详情"
      ),
      i.createElement(
        s,
        {
          type: "primary",
          size: "small",
          icon: d ? i.createElement(d) : void 0,
          disabled: !p,
          onClick: (R) => {
            R.stopPropagation(), n && n();
          },
          style: Ke
        },
        u.managed_by_app ? "打开应用" : "召唤专家"
      )
    )
  );
}
function go({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r,
  onSummon: i
}) {
  const a = T().React, {
    Drawer: l,
    Descriptions: s,
    Tag: o,
    Typography: d,
    Space: c,
    Button: u,
    Empty: m,
    Tabs: p,
    List: w,
    Spin: g,
    Modal: y,
    message: f
  } = T().antd, { Text: v, Paragraph: S } = d, {
    EditOutlined: b,
    ThunderboltOutlined: x,
    FileTextOutlined: R,
    ToolOutlined: J,
    PlusOutlined: P
  } = T().antdIcons || {}, [j, X] = a.useState(!1), [q, U] = a.useState(
    []
  ), [$, A] = a.useState(!1);
  if (!e) return null;
  const { agent: M, config: _, skills: O, mcps: D, loading: Y } = e, z = O.filter((G) => G.enabled !== !1), C = (G) => {
    window.history.pushState({}, "", G), window.dispatchEvent(new PopStateEvent("popstate"));
  }, te = a.createElement(
    "div",
    null,
    a.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(s.Item, { label: "专家名称" }, M.name),
      a.createElement(
        s.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, M.id)
      ),
      a.createElement(
        s.Item,
        { label: "状态" },
        a.createElement(
          o,
          { color: M.enabled ? "green" : "default" },
          M.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        s.Item,
        { label: "功能简介" },
        M.description ? $n(M.description, a) : "暂无描述"
      ),
      a.createElement(
        s.Item,
        { label: "使用模型" },
        M.active_model ? `${M.active_model.provider_id} / ${M.active_model.model}` : "使用全局默认模型"
      ),
      _ != null && _.workspace_dir ? a.createElement(
        s.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          _.workspace_dir
        )
      ) : null,
      _ != null && _.approval_level ? a.createElement(
        s.Item,
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
        R ? a.createElement(R, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(v, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ..._.system_prompt_files.map(
          (G, ue) => a.createElement(
            o,
            {
              key: ue,
              icon: R ? a.createElement(R) : void 0,
              style: { fontSize: 12 }
            },
            G
          )
        )
      )
    ) : null
  ), re = async () => {
    X(!0), A(!0);
    try {
      const G = await Rn(!0);
      U(G);
    } catch (G) {
      f.error(G.message || "加载技能池失败");
    } finally {
      A(!1);
    }
  }, F = async (G) => {
    let ue = 0, N = 0;
    for (const k of G)
      try {
        await gr(M.id, k), ue++;
      } catch {
        N++;
      }
    ue > 0 ? (f.success(
      `成功添加 ${ue} 个技能${N > 0 ? `，${N} 个失败` : ""}`
    ), r()) : N > 0 && f.error("添加技能失败"), X(!1);
  }, L = async (G) => {
    try {
      await yr(M.id, G), f.success(`技能「${G}」已移除`), r();
    } catch (ue) {
      f.error(ue.message || "移除技能失败");
    }
  }, le = async (G) => {
    try {
      await ni(M.id, G), f.success(`MCP「${G}」已移除`), r();
    } catch (ue) {
      f.error(ue.message || "移除 MCP 失败");
    }
  }, ie = Y ? a.createElement(
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
        v,
        { strong: !0 },
        `已启用技能 (${z.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: P ? a.createElement(P) : void 0,
          onClick: re
        },
        "从技能池添加"
      )
    ),
    z.length === 0 ? a.createElement(m, {
      description: "该专家暂无已启用的技能",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(w, {
      dataSource: z,
      renderItem: (G) => a.createElement(
        w.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => L(G.name)
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
            G.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              G.emoji
            ) : null,
            a.createElement(v, { strong: !0 }, G.name),
            G.version_text ? a.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${G.version_text}`
            ) : null
          ),
          G.description ? a.createElement(
            S,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            G.description
          ) : null,
          G.tags && G.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...G.tags.map(
              (ue, N) => a.createElement(
                o,
                {
                  key: N,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                ue
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    a.createElement(ai, {
      open: j,
      onClose: () => X(!1),
      poolSkills: q,
      installedSkillNames: z.map((G) => G.name),
      loading: $,
      onInstall: F
    })
  ), W = Y ? a.createElement(
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
        v,
        { strong: !0 },
        `MCP 客户端 (${D.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: P ? a.createElement(P) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${M.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    D.length === 0 ? a.createElement(m, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(w, {
      dataSource: D,
      renderItem: (G) => a.createElement(
        w.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => le(G.key)
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
              v,
              { strong: !0 },
              G.name || G.key
            ),
            a.createElement(
              o,
              {
                color: G.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              G.enabled ? "启用" : "停用"
            ),
            a.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              G.transport
            )
          ),
          G.description ? a.createElement(
            S,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            G.description
          ) : null,
          G.tools && G.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${G.tools.length} 个工具`
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
        J ? a.createElement(J, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(v, { strong: !0 }, "工具配置")
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
  ) : a.createElement(m, {
    description: "暂无工具配置",
    image: m.PRESENTED_IMAGE_SIMPLE
  }), ae = [
    { key: "basic", label: "基本信息", children: te },
    {
      key: "skills",
      label: `技能 (${z.length})`,
      children: ie
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(io, {
        skills: z,
        agentId: M.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(ii, {
        agentId: M.id,
        systemPromptFiles: (_ == null ? void 0 : _.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${D.length})`, children: W },
    { key: "tools", label: "工具配置", children: pe }
  ];
  return a.createElement(
    l,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(dt, { name: M.name, size: 28 }),
        a.createElement("span", null, M.name)
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
            icon: b ? a.createElement(b) : void 0,
            onClick: () => {
              n();
              try {
                const G = T();
                G.setSelectedAgent && G.setSelectedAgent(M.id);
              } catch (G) {
                console.warn("[ugsci] Failed to set selected agent:", G);
              }
              setTimeout(() => C("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: x ? a.createElement(x) : void 0,
            disabled: !M.enabled,
            onClick: () => {
              n(), i(e);
            }
          },
          M.managed_by_app ? "打开应用" : "开始对话"
        )
      )
    },
    a.createElement(p, {
      items: ae,
      defaultActiveKey: "basic"
    })
  );
}
function yo({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = T().React, { useState: i } = r, {
    Modal: a,
    Card: l,
    Tag: s,
    Input: o,
    Row: d,
    Col: c,
    Spin: u,
    message: m,
    Typography: p
  } = T().antd, { Text: w } = p, { FileAddOutlined: g } = T().antdIcons || {}, [y, f] = i(!1), [v, S] = i(""), [b, x] = i(!1), R = async (j) => {
    f(!0);
    try {
      const X = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: j.id || void 0,
          name: j.name,
          description: j.description,
          skill_names: j.skillNames
        })
      }), q = j.systemPrompt.trim() || `# ${j.name}

你是${j.name}。${j.description ? `

职责：${j.description}` : ""}
`, $ = (await Promise.allSettled([
        kt(X.id, "AGENTS.md", q),
        ...j.mcpClients.map(
          ({ clientKey: A, client: M }) => Er(X.id, {
            client_key: A,
            client: M
          })
        )
      ])).filter(
        (A) => A.status === "rejected"
      ).length;
      $ > 0 ? m.warning(
        `专家「${j.name}」已创建，${$} 项初始配置失败，可在专家配置中重试`
      ) : m.success(`专家「${j.name}」创建成功`), await aa(X.id), x(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (X) {
      m.error(X.message || "创建专家失败");
    } finally {
      f(!1);
    }
  }, J = mo.filter((j) => {
    if (!v.trim()) return !0;
    const X = v.toLowerCase();
    return j.name.toLowerCase().includes(X) || j.description.toLowerCase().includes(X) || j.category.toLowerCase().includes(X);
  }), P = async (j) => {
    f(!0);
    try {
      const X = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: j.name,
          description: j.description,
          skill_names: j.recommended_skills
        })
      });
      await kt(
        X.id,
        "AGENTS.md",
        j.system_prompt
      ), j.profile_prompt && (await kt(
        X.id,
        "PROFILE.md",
        j.profile_prompt
      ), await kt(
        X.id,
        "BOOTSTRAP.md",
        `# 初始化已完成

此专家已按 UGSci 模板设置身份、风格与领域技能。直接执行 AGENTS.md 的领域工作流程，无需再次询问称呼、风格或初始化设置。
`
      ));
      const q = await fr(X.id);
      q.approval_level = j.approval_level, await ce(`/agents/${encodeURIComponent(X.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q)
      }), await aa(X.id), m.success(`专家「${j.name}」创建成功`), t(), n();
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
        r.createElement(o, {
          placeholder: "搜索模板名称或类别...",
          value: v,
          onChange: (j) => S(j.target.value),
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
        d,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        v.trim() ? null : r.createElement(
          c,
          { xs: 24, sm: 12 },
          r.createElement(
            l,
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
        ...J.map(
          (j) => r.createElement(
            c,
            { key: j.id, xs: 24, sm: 12 },
            r.createElement(
              l,
              {
                hoverable: !0,
                size: "small",
                onClick: () => P(j),
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
                  name: j.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    w,
                    { strong: !0, style: { fontSize: 15 } },
                    j.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      s,
                      { color: "blue", style: { fontSize: 10 } },
                      j.category
                    ),
                    j.approval_level === "MANUAL" ? r.createElement(
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
                $n(j.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(Eo, {
      open: b,
      onCancel: () => x(!1),
      onCreate: R
    })
  );
}
function Mt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function ho(e) {
  const t = e.trim();
  if (!t) return [];
  const n = JSON.parse(t);
  if (!Mt(n))
    throw new Error("MCP 配置必须是 JSON 对象");
  const r = n.mcpServers ?? n;
  if (!Mt(r))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(r).map(([i, a]) => {
    const l = i.trim();
    if (!l || !Mt(a))
      throw new Error(`MCP「${i || "未命名"}」配置无效`);
    const s = typeof a.url == "string" ? a.url : "", o = typeof a.command == "string" ? a.command : "";
    if (!s && !o)
      throw new Error(`MCP「${l}」需要配置 url 或 command`);
    const c = (typeof a.transport == "string" ? a.transport : typeof a.type == "string" ? a.type : "") === "sse" ? "sse" : s ? "streamable_http" : "stdio";
    return {
      clientKey: l,
      client: {
        name: typeof a.name == "string" ? a.name : l,
        description: typeof a.description == "string" ? a.description : "",
        enabled: typeof a.enabled == "boolean" ? a.enabled : !0,
        transport: c,
        url: s,
        command: o,
        args: Array.isArray(a.args) ? a.args : [],
        env: Mt(a.env) ? a.env : {},
        cwd: typeof a.cwd == "string" ? a.cwd : "",
        headers: Mt(a.headers) ? a.headers : {}
      }
    };
  });
}
function Eo({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = T().React, { useState: i, useEffect: a, useMemo: l } = r, {
    Modal: s,
    Input: o,
    Select: d,
    Button: c,
    Row: u,
    Col: m,
    Spin: p,
    Tag: w,
    Typography: g,
    message: y
  } = T().antd, { CheckCircleOutlined: f } = T().antdIcons || {}, { Text: v } = g, [S, b] = i(""), [x, R] = i(""), [J, P] = i(""), [j, X] = i(""), [q, U] = i([]), [$, A] = i([]), [M, _] = i(!1), [O, D] = i(""), [Y, z] = i(!1);
  a(() => {
    e && (b(""), R(""), P(""), X(""), A([]), D(""), z(!1), _(!0), Rn(!0).then(U).catch((ie) => {
      U([]), y.error(ie.message || "加载技能池失败");
    }).finally(() => _(!1)));
  }, [e]);
  const C = x.trim(), te = l(() => C ? C.length < 2 || C.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(C) ? C === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [C]), re = l(() => {
    try {
      return { clients: ho(O), error: "" };
    } catch (ie) {
      return {
        clients: [],
        error: ie.message || "MCP 配置无效"
      };
    }
  }, [O]), F = () => {
    const ie = S.trim();
    if (!ie) {
      y.warning("请输入专家名称");
      return;
    }
    if (te) {
      y.warning(te);
      return;
    }
    if (re.error) {
      y.warning(re.error);
      return;
    }
    z(!0), Promise.resolve(
      n({
        id: C,
        name: ie,
        description: J.trim(),
        systemPrompt: j,
        skillNames: $,
        mcpClients: re.clients
      })
    ).finally(() => z(!1));
  }, L = () => {
    A(
      q.filter((ie) => ie.source === "builtin").map((ie) => ie.name)
    );
  }, le = (ie, W) => r.createElement(
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
      v,
      { strong: !0, style: { fontSize: 15 } },
      ie
    ),
    W ? r.createElement(
      v,
      { type: "secondary", style: { fontSize: 12 } },
      W
    ) : null
  );
  return r.createElement(
    s,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: F,
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
      le("基本信息", "ID 留空时自动生成"),
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
            value: S,
            onChange: (ie) => b(ie.target.value),
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
            onChange: (ie) => R(ie.target.value),
            maxLength: 64,
            status: te ? "error" : void 0
          }),
          te ? r.createElement(
            "div",
            { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } },
            te
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
            value: J,
            onChange: (ie) => P(ie.target.value),
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
        value: j,
        onChange: (ie) => X(ie.target.value),
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
      le("初始能力"),
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
            r.createElement(v, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(
                c,
                {
                  size: "small",
                  onClick: L,
                  disabled: M
                },
                "内置"
              ),
              r.createElement(
                c,
                {
                  size: "small",
                  onClick: () => A([]),
                  disabled: $.length === 0
                },
                "清空"
              )
            )
          ),
          M ? r.createElement(
            "div",
            { style: { textAlign: "center", padding: 32 } },
            r.createElement(p, { size: "small" })
          ) : r.createElement(d, {
            mode: "multiple",
            value: $,
            onChange: A,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: q.map((ie) => ({
              value: ie.name,
              label: ie.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            $.length > 0 ? r.createElement(
              w,
              { color: "blue" },
              `已选择 ${$.length} 个技能`
            ) : r.createElement(
              v,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加技能"
            )
          )
        ),
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            v,
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
            value: O,
            onChange: (ie) => D(ie.target.value),
            rows: 8,
            status: re.error ? "error" : void 0,
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12
            }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            re.error ? r.createElement(
              v,
              { type: "danger", style: { fontSize: 12 } },
              re.error
            ) : re.clients.length > 0 ? r.createElement(
              w,
              {
                color: "green",
                icon: f ? r.createElement(f) : void 0
              },
              `已识别 ${re.clients.length} 个 MCP`
            ) : r.createElement(
              v,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加 MCP"
            )
          )
        )
      )
    )
  );
}
const di = "ugsci_custom_teams";
function bo(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function vo() {
  try {
    const e = JSON.parse(
      localStorage.getItem(di) || "[]"
    );
    return Array.isArray(e) ? e.filter(bo) : [];
  } catch {
    return [];
  }
}
function wo(e) {
  try {
    localStorage.setItem(di, JSON.stringify(e));
  } catch {
  }
}
function So(e) {
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
function xo(e) {
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
async function Yn(e = !0) {
  const t = await ct("/ugsci/team/custom");
  if (!t.ok) {
    const i = await t.text().catch(() => "");
    throw new Error(i || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(xo);
  return e && wo(r), r;
}
async function ui(e) {
  const t = await ct("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(So(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function _o(e) {
  const t = await ct(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function ko() {
  const e = vo();
  if (e.length === 0) return;
  const t = await Yn(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => ui(r))
  );
}
async function Co(e) {
  var i, a;
  const t = (i = e.body) == null ? void 0 : i.getReader();
  if (!t) return;
  const n = new TextDecoder();
  let r = "";
  try {
    for (; ; ) {
      const { done: l, value: s } = await t.read();
      if (l) break;
      r += n.decode(s, { stream: !0 });
      let o;
      for (; (o = r.indexOf(`

`)) >= 0; ) {
        const d = r.slice(0, o);
        r = r.slice(o + 2);
        for (const c of d.split(`
`)) {
          if (!c.startsWith("data: ")) continue;
          const u = c.slice(6);
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
              const w = ((a = m.error) == null ? void 0 : a.message) || "工作流启动失败";
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
async function To(e, t, n) {
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
    const o = await i.text().catch(() => "");
    throw new Error(
      o || `创建会话失败 (HTTP ${i.status})`
    );
  }
  const l = (await i.json()).id, s = await ct("/console/chat", {
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
  return await Co(s), l;
}
function mi(e, t) {
  var i;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (a) => a.name === t || a.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((i = e.find(
    (a) => a.name.includes(t) || t.includes(a.name) || a.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : i.id) || null;
}
function pi() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function fi(e, t) {
  const n = await e.text().catch(() => "");
  if (!n) return t;
  try {
    const r = JSON.parse(n);
    if (typeof r.detail == "string") return r.detail;
  } catch {
  }
  return n;
}
async function vr(e, t, n) {
  const r = await ct(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await fi(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function Io(e, t) {
  return vr("/ugsci/team/state", e, t);
}
async function $o(e, t) {
  const n = await ct("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await fi(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const zo = 5e3;
function ia({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = pi(), r = n.React, { useCallback: i, useEffect: a, useRef: l, useState: s } = r, { Alert: o, Button: d, Card: c, Empty: u, Spin: m, Tag: p, Typography: w } = n.antd, { Text: g, Paragraph: y } = w, f = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, v = (f == null ? void 0 : f.id) || "default", [S, b] = s([]), [x, R] = s(!0), [J, P] = s(null), [j, X] = s(!1), q = l(null), U = l(0), $ = l(!1), A = l(v), M = i(
    async (D = !0, Y = !0) => {
      var te;
      if (!t || !Y && $.current) return;
      (te = q.current) == null || te.abort();
      const z = new AbortController();
      q.current = z;
      const C = ++U.current;
      $.current = !0, D && R(!0);
      try {
        const re = await $o(v, z.signal);
        if (z.signal.aborted || C !== U.current)
          return;
        b(re), X(!0), P(null);
      } catch (re) {
        if (z.signal.aborted || C !== U.current)
          return;
        P(
          re instanceof Error ? re.message : "讨论运行记录加载失败"
        );
      } finally {
        !z.signal.aborted && C === U.current && (q.current = null, $.current = !1, R(!1));
      }
    },
    [v, t]
  );
  if (a(() => {
    var Y;
    if (!t) {
      (Y = q.current) == null || Y.abort(), q.current = null, $.current = !1, U.current += 1;
      return;
    }
    A.current !== v && (A.current = v, b([]), P(null), X(!1)), M(!0, !0);
    const D = e ? window.setInterval(() => {
      M(!1, !1);
    }, zo) : null;
    return () => {
      var z;
      D !== null && window.clearInterval(D), (z = q.current) == null || z.abort(), q.current = null, $.current = !1, U.current += 1;
    };
  }, [e, v, t, M]), x && !j) return r.createElement(m);
  if (J && !j)
    return r.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: J,
      action: r.createElement(
        d,
        { size: "small", onClick: () => void M(!0, !0), loading: x },
        "重试"
      )
    });
  const _ = S.filter(
    (D) => e ? D.status === "active" : D.status !== "active"
  ), O = (D) => J ? r.createElement(
    r.Fragment,
    null,
    r.createElement(o, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: J,
      action: r.createElement(
        d,
        {
          size: "small",
          onClick: () => void M(!0, !0),
          loading: x
        },
        "重试"
      )
    }),
    D
  ) : D;
  return _.length === 0 ? O(
    r.createElement(
      u,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        d,
        { size: "small", onClick: () => void M(!0, !0), loading: x },
        "刷新"
      )
    )
  ) : O(
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
          { size: "small", onClick: () => void M(!0, !0), loading: x },
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
              y,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              D.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function Ao() {
  try {
    return (await vr(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function Po() {
  try {
    return (await vr(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const Ro = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, la = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], oa = 5e3, Oo = 3e4;
function Mo({ enabled: e = !0 }) {
  const t = pi(), n = t.React, { useState: r, useEffect: i, useCallback: a, useRef: l } = n, { Card: s, Tag: o, Typography: d, Button: c, Steps: u, Empty: m, Alert: p, Spin: w } = t.antd, { ReloadOutlined: g } = t.antdIcons || {}, { Text: y, Paragraph: f } = d, v = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, S = (v == null ? void 0 : v.id) || "default", [b, x] = r(null), [R, J] = r(!1), [P, j] = r(null), X = l(null), q = l(0), U = l(0), $ = l(0), A = l(null), M = l(!1), _ = a(
    async (W, pe = !0) => {
      var ue;
      if (!e || !pe && M.current) return;
      (ue = A.current) == null || ue.abort();
      const ae = new AbortController();
      A.current = ae;
      const G = ++$.current;
      M.current = !0, W && J(!0);
      try {
        const N = await Io(S, ae.signal);
        if (ae.signal.aborted || G !== $.current)
          return;
        q.current = 0, U.current = 0, X.current = N, x(N), j(null);
      } catch (N) {
        if (ae.signal.aborted || G !== $.current)
          return;
        q.current += 1;
        const k = Math.min(
          Oo,
          oa * 2 ** (q.current - 1)
        );
        U.current = Date.now() + k, j(
          N instanceof Error ? N.message : "专家团状态加载失败"
        );
      } finally {
        !ae.signal.aborted && G === $.current && (A.current = null, M.current = !1, J(!1));
      }
    },
    [S, e]
  ), O = a(() => (q.current = 0, U.current = 0, _(!0)), [_]);
  if (i(() => {
    var pe;
    if ((pe = A.current) == null || pe.abort(), A.current = null, M.current = !1, $.current += 1, q.current = 0, U.current = 0, X.current = null, x(null), j(null), !e) return;
    O();
    const W = window.setInterval(() => {
      var ae, G;
      Date.now() < U.current || ((ae = X.current) == null ? void 0 : ae.status) === "completed" || ((G = X.current) == null ? void 0 : G.status) === "terminated" || _(!1, !1);
    }, oa);
    return () => {
      var ae;
      window.clearInterval(W), (ae = A.current) == null || ae.abort(), A.current = null, M.current = !1, $.current += 1;
    };
  }, [S, e, _, O]), R && !b && !P)
    return n.createElement(w);
  if (P && !b)
    return n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: P,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: O, loading: R },
        "重试"
      )
    });
  const D = (W) => P ? n.createElement(
    n.Fragment,
    null,
    n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: P,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: O, loading: R },
        "重试"
      )
    }),
    W
  ) : W;
  if ((b == null ? void 0 : b.status) === "unreadable")
    return D(
      n.createElement(p, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${b.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          c,
          { size: "small", onClick: O, loading: R },
          "重试"
        )
      })
    );
  if (!b || !b.active) {
    if ((b == null ? void 0 : b.status) === "completed" || (b == null ? void 0 : b.status) === "terminated") {
      const W = b.status === "completed";
      return D(
        n.createElement(p, {
          type: W ? "success" : "info",
          showIcon: !0,
          message: W ? "专家团工作流已完成" : "专家团工作流已终止",
          description: W ? `实例 ${b.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${b.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return D(
      n.createElement(m, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const Y = b.state, z = Y.current_phase || "plan", C = la.indexOf(z), te = Y.team_name || "未知团队", re = Y.team_mode || "pipeline", F = Y.iteration || 0, L = Y.members || [], le = Y.verify_retries || 0, ie = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return D(
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
            `${te} — 工作流状态`
          ),
          n.createElement(
            o,
            { color: "blue", style: { fontSize: 10 } },
            ie[re] || re
          ),
          n.createElement(
            o,
            { style: { fontSize: 10 } },
            `迭代 ${F}`
          ),
          le > 0 ? n.createElement(
            o,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${le}`
          ) : null
        ),
        extra: n.createElement(
          c,
          {
            size: "small",
            type: "text",
            icon: g ? n.createElement(g) : void 0,
            onClick: O,
            loading: R
          },
          "刷新"
        )
      },
      n.createElement(u, {
        current: C,
        size: "small",
        items: la.map((W) => {
          const pe = Ro[W];
          return {
            title: `${pe.icon} ${pe.label}`,
            description: W === "plan" ? "分析任务，创建任务分解" : W === "dispatch" ? "分派专家执行任务" : W === "verify" ? "交叉验证专家结果" : W === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
          (W, pe) => n.createElement(
            o,
            { key: `${W.name}-${pe}`, style: { fontSize: 11 } },
            `${W.emoji || ""} ${W.name}（${W.role}）`
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
function Lo({ team: e }) {
  const t = T().React, { Typography: n, Tag: r } = T().antd, { Text: i } = n, a = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙",
    router: "◇",
    review_loop: "↻",
    debate: "⇄"
  }, l = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff",
    router: "#d46b08",
    review_loop: "#389e0d",
    debate: "#c41d7f"
  }, s = e.steps || [], o = e.mode === "roundtable" || e.mode === "router", d = {
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
          flexDirection: o ? "row" : "column",
          gap: 8,
          alignItems: o ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...s.length > 0 ? s.map((c, u) => [
        u > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: l[e.mode],
              fontSize: 14
            }
          },
          a[e.mode]
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
              border: `1px solid ${l[e.mode]}33`,
              fontSize: 12,
              flex: o ? "1 1 200px" : "initial"
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
      ]).flat() : e.members.map((c, u) => [
        u > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: l[e.mode],
              fontSize: 14
            }
          },
          a[e.mode]
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
              border: `1px solid ${l[e.mode]}33`,
              fontSize: 12,
              flex: o ? "1 1 150px" : "initial"
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
function sn(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Bo = [
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
function jo({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: i
}) {
  const a = T().React, { useState: l, useEffect: s, useCallback: o } = a, {
    Modal: d,
    Input: c,
    Button: u,
    Select: m,
    Tag: p,
    Typography: w,
    Switch: g,
    Empty: y,
    message: f,
    Divider: v,
    Steps: S
  } = T().antd, { PlusOutlined: b, DeleteOutlined: x, SaveOutlined: R, ArrowRightOutlined: J } = T().antdIcons || {}, { Text: P, Paragraph: j } = w, [X, q] = l(""), [U, $] = l("🤝"), [A, M] = l(""), [_, O] = l("pipeline"), [D, Y] = l(""), [z, C] = l(""), [te, re] = l([]), [F, L] = l([]), [le, ie] = l(!1), [W, pe] = l(2), [ae, G] = l(""), [ue, N] = l(""), [k, oe] = l({}), [he, xe] = l({}), [ze, Se] = l(
    Bo
  ), me = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  s(() => {
    e && (r ? (q(r.name), $(r.emoji), M(r.description), O(r.mode), Y(r.coordinatorName || ""), C(r.taskTemplate), re(r.steps || []), L(r.members.map((h) => h.name)), pe(r.maxReviewRounds || 2), G(r.successCriteria || ""), N(r.routingInstruction || ""), oe(
      Object.fromEntries(
        r.members.map((h) => [
          h.name,
          h.bindingMode || (h.agentId ? "fixed" : "preferred")
        ])
      )
    ), xe(
      Object.fromEntries(
        r.members.map((h) => [
          h.name,
          h.roleKey || sn(h.name)
        ])
      )
    )) : (q(""), $("🤝"), M(""), O("pipeline"), Y(""), C(`请执行以下任务：
任务描述：{任务描述}`), re([]), L([]), pe(2), G(""), N(""), oe({}), xe({})));
  }, [e, r]), s(() => {
    e && Po().then((h) => {
      h != null && h.length && Se(h);
    });
  }, [e]);
  const Ie = o(() => {
    if (_ === "roundtable" || _ === "debate" || _ === "router") {
      const h = F.map((V) => ({
        agentName: V,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      re(h);
    } else if (_ === "pipeline") {
      const h = new Map(te.map((I) => [I.agentName, I])), V = F.map((I) => h.get(I) || {
        agentName: I,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      re(V);
    }
  }, [_, F, te]), Pe = (h) => {
    F.includes(h) || (L([...F, h]), oe({ ...k, [h]: "fixed" }), xe({
      ...he,
      [h]: sn(h)
    }), (_ === "coordinator" || _ === "debate") && !D && Y(h));
  }, Q = (h) => {
    const V = F.filter((ge) => ge !== h);
    L(V), re(te.filter((ge) => ge.agentName !== h));
    const I = { ...k };
    delete I[h], oe(I);
    const se = { ...he };
    delete se[h], xe(se), D === h && Y(V[0] || "");
  }, ye = (h, V, I) => {
    const se = [...te];
    se[h] = { ...se[h], [V]: I }, re(se);
  }, ve = async () => {
    if (!X.trim()) {
      f.warning("请输入团队名称");
      return;
    }
    if (F.length < 2) {
      f.warning("至少需要选择 2 个成员");
      return;
    }
    if (!z.trim()) {
      f.warning("请输入任务模板");
      return;
    }
    if ((_ === "coordinator" || _ === "debate") && !D) {
      f.warning(_ === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    ie(!0);
    try {
      let h = [...F];
      _ === "coordinator" && D ? h = [D, ...h.filter((ge) => ge !== D)] : _ === "debate" && D && (h = [...h.filter((ge) => ge !== D), D]);
      const V = h.map(
        (ge) => {
          var rt;
          const Ee = n.find((Ue) => Ue.name === ge), $e = k[ge] || "fixed", Le = he[ge] || sn(ge), Ge = ze.find((Ue) => Ue.key === Le);
          return {
            name: ge,
            role: (Ge == null ? void 0 : Ge.display_name) || ((rt = Ee == null ? void 0 : Ee.description) == null ? void 0 : rt.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: $e === "temporary" || Ee == null ? void 0 : Ee.id,
            roleKey: Le,
            bindingMode: $e
          };
        }
      );
      let I = te;
      (te.length === 0 || te.length !== F.length) && (I = F.map((ge) => ({
        agentName: ge,
        instruction: "请完成你的专业部分",
        passContext: _ === "pipeline"
      })));
      const se = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: X.trim(),
        emoji: U,
        category: "自定义",
        description: A.trim() || `${X.trim()}（${F.length}人团队）`,
        mode: _,
        members: V,
        coordinatorName: _ === "coordinator" || _ === "debate" ? D : void 0,
        taskTemplate: z.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: I,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: W,
        successCriteria: ae.trim(),
        routingInstruction: ue.trim()
      };
      await ui(se), f.success(r ? "团队已更新" : "团队已创建"), i(), t();
    } catch (h) {
      f.error(h.message || "保存失败");
    } finally {
      ie(!1);
    }
  }, ke = n.filter(
    (h) => !F.includes(h.name)
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
      onOk: ve,
      okText: "保存专家团",
      confirmLoading: le,
      okButtonProps: {
        icon: R ? a.createElement(R) : void 0
      }
    },
    // Step 1: Basic info
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        P,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        F.length > 0 ? a.createElement(br, {
          members: F,
          size: 36
        }) : null,
        a.createElement(c, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: X,
          onChange: (h) => q(h.target.value),
          style: { flex: 1 }
        })
      ),
      a.createElement(c.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: A,
        onChange: (h) => M(h.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      a.createElement(
        P,
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
        ...me.map((h) => {
          const V = _ === h.value;
          return a.createElement(
            "button",
            {
              key: h.value,
              type: "button",
              onClick: () => {
                O(h.value), h.value !== "coordinator" && h.value !== "debate" && Y("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: V ? `${h.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${V ? h.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: V ? `0 0 0 2px ${h.accent}1a` : "none"
              }
            },
            a.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: h.accent, fontWeight: 600 } },
              a.createElement("span", { style: { fontSize: 18 } }, h.icon),
              h.title
            ),
            a.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, h.description),
            a.createElement("div", { style: { fontSize: 10, color: h.accent, marginTop: 5, fontFamily: "monospace" } }, h.topology)
          );
        })
      )
    ),
    a.createElement(v, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        P,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      ke.length > 0 ? a.createElement(
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
        ...ke.map(
          (h) => a.createElement(
            u,
            {
              key: h.id,
              size: "small",
              icon: b ? a.createElement(b) : void 0,
              onClick: () => Pe(h.name)
            },
            h.name
          )
        )
      ) : null,
      // Selected members
      F.length === 0 ? a.createElement(y, {
        description: "请从上方添加团队成员",
        image: y.PRESENTED_IMAGE_SIMPLE
      }) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...F.map(
          (h) => a.createElement(
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
            a.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              a.createElement(dt, { name: h, size: 24 }),
              a.createElement(
                P,
                { strong: !0, style: { fontSize: 13 } },
                h
              ),
              (_ === "coordinator" || _ === "debate") && D === h ? a.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                _ === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            a.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              a.createElement(m, {
                size: "small",
                value: he[h] || sn(h),
                style: { width: 132 },
                onChange: (V) => xe({ ...he, [h]: V }),
                options: ze.map((V) => ({
                  value: V.key,
                  label: V.display_name
                }))
              }),
              a.createElement(m, {
                size: "small",
                value: k[h] || "fixed",
                style: { width: 118 },
                onChange: (V) => oe({ ...k, [h]: V }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              _ === "coordinator" || _ === "debate" ? a.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  onClick: () => Y(h)
                },
                _ === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              a.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: x ? a.createElement(x) : void 0,
                  onClick: () => Q(h)
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
        a.createElement(m, {
          value: W,
          onChange: (h) => pe(h),
          options: [1, 2, 3, 4, 5].map((h) => ({ value: h, label: `最多 ${h} 轮` }))
        }),
        a.createElement(c, {
          value: ae,
          onChange: (h) => G(h.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : a.createElement(c, {
        value: ue,
        onChange: (h) => N(h.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    a.createElement(v, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    F.length > 0 ? a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        P,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${_ === "roundtable" ? "（并行独立）" : _ === "pipeline" ? "（顺序交接）" : _ === "router" ? "（作为候选能力）" : _ === "review_loop" ? "（首位执行、末位评审）" : _ === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      a.createElement(
        u,
        {
          size: "small",
          type: "dashed",
          onClick: Ie,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      te.length === 0 ? a.createElement(
        P,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...te.map(
          (h, V) => a.createElement(
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
                h.agentName
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(c, {
                  placeholder: "请输入该步骤的指令...",
                  value: h.instruction,
                  onChange: (I) => ye(V, "instruction", I.target.value),
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
                checked: h.passContext,
                onChange: (I) => ye(V, "passContext", I)
              }),
              a.createElement(
                P,
                { type: "secondary", style: { fontSize: 11 } },
                h.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    a.createElement(v, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    a.createElement(
      "div",
      null,
      a.createElement(
        P,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${F.length > 0 ? "4" : "3"}. 任务模板`
      ),
      a.createElement(c.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: z,
        onChange: (h) => C(h.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      a.createElement(
        P,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function sa({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: i
}) {
  var $;
  const a = T().React, { useState: l } = a, { Card: s, Tag: o, Typography: d, Button: c, Tooltip: u, Popconfirm: m } = T().antd, {
    TeamOutlined: p,
    RocketOutlined: w,
    UserOutlined: g,
    EditOutlined: y,
    DeleteOutlined: f,
    DownOutlined: v,
    UpOutlined: S
  } = T().antdIcons || {}, { Text: b, Paragraph: x } = d, [R, J] = l(!1), P = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, j = P[e.mode] || P.coordinator, X = e.members.map((A) => {
    const M = A.bindingMode === "temporary", _ = M ? null : (A.agentId && t.some((O) => O.id === A.agentId) ? A.agentId : null) || mi(t, A.name);
    return { ...A, found: !!_, agentId: _, temporary: M };
  }), q = X.filter((A) => A.found).length, U = e.coordinatorName || (($ = e.members[0]) == null ? void 0 : $.name);
  return a.createElement(
    s,
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
      a.createElement(br, {
        members: e.members.map((A) => A.name),
        size: 36
      }),
      a.createElement(
        "div",
        { style: { flex: 1 } },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          a.createElement(
            b,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? a.createElement(
            o,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        a.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          a.createElement(
            o,
            { color: j.color, style: { fontSize: 10 } },
            j.label
          ),
          a.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          q < e.members.length ? a.createElement(
            u,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            a.createElement(
              o,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : a.createElement(
            o,
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
          u,
          { title: "编辑" },
          a.createElement(c, {
            type: "text",
            size: "small",
            icon: y ? a.createElement(y) : void 0,
            onClick: (A) => {
              A.stopPropagation(), r(e);
            }
          })
        ) : null,
        i ? a.createElement(
          u,
          { title: "删除" },
          a.createElement(
            m,
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
              onClick: (A) => A.stopPropagation()
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
      ...X.map(
        (A) => a.createElement(
          u,
          {
            key: A.name,
            title: `${A.name}（${A.role}）${A.temporary ? " - OMP 临时派生" : A.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: A.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${A.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            a.createElement(dt, { name: A.name, size: 18 }),
            a.createElement(
              b,
              {
                style: { fontSize: 11, color: A.found ? "#1f4e8c" : "#531dab" }
              },
              A.name
            ),
            A.temporary ? a.createElement(
              o,
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
        onClick: (A) => {
          A.stopPropagation(), J(!R);
        },
        icon: R ? S ? a.createElement(S) : "▲" : v ? a.createElement(v) : "▼"
      },
      R ? "收起流程" : "查看执行流程"
    ),
    R ? a.createElement(Lo, { team: e }) : null,
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
        b,
        { type: "secondary", style: { fontSize: 11 } },
        U ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${U}` : "OMP 动态编排"
      ),
      a.createElement(
        c,
        {
          type: "primary",
          size: "small",
          icon: w ? a.createElement(w) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: Ke
        },
        "运行工作流"
      )
    )
  );
}
function Uo({
  agents: e,
  onLaunch: t
}) {
  const n = T().React, { useMemo: r, useState: i, useCallback: a, useEffect: l } = n, {
    Row: s,
    Col: o,
    Input: d,
    Empty: c,
    Typography: u,
    Tag: m,
    Button: p,
    Divider: w,
    Tabs: g,
    message: y
  } = T().antd, { SearchOutlined: f, PlusOutlined: v, RocketOutlined: S } = T().antdIcons || {}, { Text: b } = u, [x, R] = i(""), [J, P] = i([]), [j, X] = i([]), [q, U] = i(!1), [$, A] = i(null), [M, _] = i("preset");
  l(() => {
    let L = !0;
    return (async () => {
      try {
        await ko();
        const le = await Yn();
        L && P(le);
      } catch (le) {
        console.warn("[ugsci] Failed to load backend expert teams:", le), L && (P([]), y.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), Ao().then((le) => {
      L && le && X(le);
    }), () => {
      L = !1;
    };
  }, []);
  const O = a(() => {
    Yn().then(P).catch((L) => {
      console.warn("[ugsci] Failed to refresh expert teams:", L), P([]), y.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [y]), D = a(
    (L) => {
      _o(L.id).then(() => {
        O(), y.success(`团队「${L.name}」已删除`);
      }).catch((le) => y.error(le.message || "删除专家团失败"));
    },
    [y, O]
  ), Y = a((L) => {
    A(L), U(!0);
  }, []), z = a(() => {
    A(null), U(!0);
  }, []), C = r(() => [...J, ...j], [J, j]), te = r(() => {
    if (!x.trim()) return C;
    const L = x.toLowerCase();
    return C.filter(
      (le) => le.name.toLowerCase().includes(L) || le.description.toLowerCase().includes(L) || le.category.toLowerCase().includes(L)
    );
  }, [C, x]), re = te.filter((L) => L.custom), F = te.filter((L) => !L.custom);
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
        onChange: (L) => R(L.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: v ? n.createElement(v) : void 0,
          onClick: z,
          style: Ke
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(
      g,
      {
        activeKey: M,
        onChange: _,
        items: [
          {
            key: "preset",
            label: `预设团队${F.length ? ` (${F.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              F.length > 0 ? n.createElement(
                s,
                { gutter: [12, 12] },
                ...F.map(
                  (L) => n.createElement(
                    o,
                    { key: L.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(sa, {
                      team: L,
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
            label: `自定义团队${re.length ? ` (${re.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              re.length > 0 ? n.createElement(
                s,
                { gutter: [12, 12] },
                ...re.map(
                  (L) => n.createElement(
                    o,
                    { key: L.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(sa, {
                      team: L,
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
              n.createElement(Mo, {
                enabled: M === "active"
              }),
              n.createElement(ia, {
                activeOnly: !0,
                enabled: M === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: n.createElement(ia, {
              enabled: M === "history"
            })
          }
        ]
      }
    ),
    // Team Builder Modal
    n.createElement(jo, {
      open: q,
      onClose: () => {
        U(!1), A(null);
      },
      agents: e,
      editingTeam: $,
      onSaved: O
    })
  );
}
const No = [
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
], Do = 5e3, Fn = {
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
function Fo(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Lt(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), Fo(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function Go(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Wo(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function Ho(e) {
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
function gi(e) {
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
function Bt(e) {
  return ["success", "completed", "skipped", "cached"].includes(e) ? "green" : ["error", "failed"].includes(e) ? "red" : ["running"].includes(e) ? "blue" : ["queued", "pending"].includes(e) ? "cyan" : "gold";
}
function qo(e, t) {
  const n = typeof e.type == "string" ? e.type : "事件", r = typeof e.node_id == "string" ? ` · ${e.node_id}` : "", i = e.state && typeof e.state == "object" ? e.state : {}, a = e.data && typeof e.data == "object" ? e.data : {}, l = [e.message, i.message, i.error, a.message, a.error].find((d) => typeof d == "string" && d.length > 0) || "";
  if (l) return `${n}${r}: ${l}`;
  const s = typeof e.status == "string" ? e.status : typeof i.status == "string" ? i.status : "", o = s ? ` · ${gi(s)}` : "";
  if (o) return `${n}${r}${o}`;
  try {
    const d = JSON.stringify(Object.keys(a).length > 0 ? a : e) || "{}", c = d.length > 240 ? `${d.slice(0, 237)}...` : d;
    return `${n}${r}: ${c}`;
  } catch {
    return `${n}${r} #${t + 1}`;
  }
}
const Vo = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function cn(e) {
  return !e.resumed_by_run_id && Vo.has(e.status);
}
function Jo() {
  const e = T().React, { useCallback: t, useEffect: n, useRef: r, useState: i } = e, {
    Alert: a,
    Button: l,
    Card: s,
    Col: o,
    Empty: d,
    Input: c,
    Popconfirm: u,
    Modal: m,
    Row: p,
    Space: w,
    Spin: g,
    Tabs: y,
    Progress: f,
    Tag: v,
    Tooltip: S,
    Typography: b,
    message: x
  } = T().antd, {
    ApartmentOutlined: R,
    DeleteOutlined: J,
    ReloadOutlined: P,
    RocketOutlined: j,
    PlayCircleOutlined: X,
    StopOutlined: q
  } = T().antdIcons || {}, { Text: U, Paragraph: $, Title: A } = b, M = T().useSelectedAgent, _ = M ? M() : { id: "default" }, O = (_ == null ? void 0 : _.id) || "default", [D, Y] = i([]), [z, C] = i([]), [te, re] = i([]), [F, L] = i(!0), [le, ie] = i(!0), [W, pe] = i(null), [ae, G] = i(null), [ue, N] = i(""), k = r(0), oe = r(O);
  oe.current = O;
  const [he, xe] = i(""), [ze, Se] = i(""), [me, Ie] = i("templates"), [Pe, Q] = i(/* @__PURE__ */ new Set()), [ye, ve] = i(/* @__PURE__ */ new Set()), ke = r(null), h = z.some(cn), V = e.useMemo(() => {
    const B = {};
    return D.forEach((de) => {
      B[de.id] = de.name;
    }), B;
  }, [D]), I = e.useMemo(() => {
    const B = {};
    return z.forEach((de) => {
      cn(de) && (B[de.flow_id] = (B[de.flow_id] || 0) + 1);
    }), B;
  }, [z]), se = t(async (B = !1) => {
    B || L(!0);
    try {
      const [de, ne, Oe] = await Promise.all([
        ce("/flowforge/flows", { bypassCache: !0 }),
        ce("/flowforge/runs", { bypassCache: !0 }),
        An().catch(() => [])
      ]);
      Y(de), C(ne), re(Oe), ie(!0);
    } catch (de) {
      console.warn("[ugsci] FlowForge is unavailable:", de), B || ie(!1);
    } finally {
      B || L(!1);
    }
  }, []);
  n(() => {
    se();
  }, [se]), n(() => {
    if (!le || !h) {
      ke.current && (clearInterval(ke.current), ke.current = null);
      return;
    }
    let B = !1;
    return ke.current = setInterval(async () => {
      if (!B) {
        B = !0;
        try {
          await se(!0);
        } finally {
          B = !1;
        }
      }
    }, Do), () => {
      ke.current && (clearInterval(ke.current), ke.current = null);
    };
  }, [h, le, se]);
  const ge = t(
    async (B) => {
      if (!W) {
        pe(B.key);
        try {
          const de = await ce(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: B.sop,
                name: B.name,
                agent_id: O
              })
            }
          ), ne = {
            ...de.nodes || {}
          }, Oe = Object.entries(ne).filter(([He]) => /^step_\d+$/.test(He)).sort(([He], [qe]) => Number(He.slice(5)) - Number(qe.slice(5))), Ce = {};
          let Fe = 0, Qe = 0;
          Oe.forEach(([He, qe], st) => {
            const We = B.roleHints[st] || "", Ne = B.roleKeys[st] || "analyst", Me = te.find(
              (nn) => `${nn.name} ${nn.id}`.toLowerCase().includes(We.toLowerCase())
            );
            Me ? Fe++ : Qe++;
            const ut = (Me == null ? void 0 : Me.id) || O, Pt = { ...qe.inputs || {} };
            Pt.agent_id = ut, ne[He] = {
              ...qe,
              inputs: Pt,
              metadata: {
                ...qe.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: We,
                role_key: Ne,
                agent_id: ut
              }
            }, Ce[He] = {
              binding_policy: "fixed_instance",
              role_hint: We,
              role_key: Ne,
              agent_id: ut
            };
          });
          const at = {
            ...de,
            nodes: ne,
            id: `${B.key}-${Date.now()}`,
            name: B.name,
            description: B.description,
            metadata: {
              ...de.metadata || {},
              domain: "oil-gas",
              template_key: B.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: O,
              node_bindings: Ce
            }
          };
          await ce("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(at)
          });
          const Ae = Oe.length > 0 ? `（${Fe} 个专家已匹配，${Qe} 个回退到控制器）` : "";
          x.success(`已创建工作流草稿「${B.name}」${Ae}`), await se();
        } catch (de) {
          x.error(de.message || "创建工作流失败");
        } finally {
          pe(null);
        }
      }
    },
    [te, O, W, se, x]
  );
  n(() => {
    k.current++, G(null), N(""), pe(null);
  }, [O]);
  const Ee = t(async () => {
    if (W || !ze.trim()) return;
    const B = ++k.current;
    pe("natural-language"), N("");
    try {
      const de = await ce("/flowforge/authoring/proposals", {
        method: "POST",
        body: JSON.stringify({ prompt: ze.trim(), name: he.trim(), agent_id: O })
      });
      B === k.current && G(de);
    } catch (de) {
      B === k.current && N(de.message || "生成失败，请检查模型配置后重试");
    } finally {
      B === k.current && pe(null);
    }
  }, [O, W, he, ze]), $e = t(async () => {
    if (!(ae != null && ae.validation.ok) || W) return;
    const B = O;
    pe("apply"), N("");
    try {
      const de = await ce(`/flowforge/authoring/proposals/${encodeURIComponent(ae.proposal_id)}/apply`, {
        method: "POST",
        body: JSON.stringify({ expected_revision: ae.base_revision })
      });
      if (oe.current !== B) return;
      G(null), xe(""), Se(""), x.success("方案已应用并保存"), Lt(de.id);
    } catch (de) {
      oe.current === B && N(de.message || "应用失败，请重新生成方案");
    } finally {
      oe.current === B && pe(null);
    }
  }, [ae, W, O, x]), Le = t(
    async (B, de) => {
      try {
        await ce(`/flowforge/flows/${encodeURIComponent(B)}`, {
          method: "DELETE"
        }), x.success(`已删除工作流「${de}」`), await se();
      } catch (ne) {
        x.error(ne.message || "删除工作流失败");
      }
    },
    [se, x]
  ), Ge = t(
    async (B) => {
      Q((de) => {
        const ne = new Set(de);
        return ne.add(B), ne;
      });
      try {
        await ce(`/flowforge/runs/${encodeURIComponent(B)}/cancel`, {
          method: "POST"
        }), x.success("已请求取消运行"), await se(!0);
      } catch (de) {
        x.error(de.message || "取消运行失败");
      } finally {
        Q((de) => {
          const ne = new Set(de);
          return ne.delete(B), ne;
        });
      }
    },
    [se, x]
  ), rt = e.createElement(
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
        w,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(c, {
          "aria-label": "工作流名称",
          value: he,
          onChange: (B) => xe(B.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(c.TextArea, {
          "aria-label": "工作流需求描述",
          value: ze,
          onChange: (B) => Se(B.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          l,
          {
            type: "primary",
            onClick: () => void Ee(),
            loading: W === "natural-language",
            disabled: !le || !!W || !ze.trim(),
            style: Ke
          },
          "生成并预览方案"
        )
      )
    ),
    e.createElement(
      p,
      { gutter: [12, 12] },
      ...No.map(
        (B) => e.createElement(
          o,
          { key: B.key, xs: 24, md: 8 },
          e.createElement(
            s,
            { style: { height: "100%" } },
            e.createElement(
              w,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, B.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(A, { level: 5, style: { margin: 0 } }, B.name),
                e.createElement(v, { color: "blue", style: { marginTop: 6 } }, B.category),
                e.createElement(
                  $,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  B.description
                ),
                e.createElement(
                  l,
                  {
                    type: "primary",
                    loading: W === B.key,
                    disabled: !le || !!W,
                    onClick: () => void ge(B),
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
      s,
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
          ([B, de, ne]) => e.createElement(
            o,
            { key: B, xs: 24, sm: 12, lg: 6 },
            e.createElement(U, { strong: !0 }, B),
            e.createElement(
              v,
              {
                color: ne === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              ne
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, de)
          )
        )
      )
    )
  ), Ue = F ? e.createElement(g) : D.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    p,
    { gutter: [12, 12] },
    ...D.map((B) => {
      const de = I[B.id] || 0;
      return e.createElement(
        o,
        { key: B.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          s,
          {
            size: "small",
            title: e.createElement(
              w,
              { size: 6 },
              e.createElement("span", null, B.name),
              de > 0 ? e.createElement(
                v,
                { color: "blue" },
                `${de} 个运行中`
              ) : null
            ),
            extra: e.createElement(v, null, `v${B.version}`)
          },
          e.createElement($, { ellipsis: { rows: 2 } }, B.description || "暂无描述"),
          e.createElement(
            w,
            { size: 8, wrap: !0 },
            e.createElement(v, { color: "geekblue" }, `${B.node_count} 个节点`),
            e.createElement(l, {
              size: "small",
              type: "primary",
              icon: X ? e.createElement(X) : void 0,
              disabled: !le,
              onClick: () => Lt(B.id)
            }, "配置并运行"),
            e.createElement(l, {
              size: "small",
              onClick: () => Lt(B.id)
            }, "编辑"),
            e.createElement(
              u,
              {
                title: "确认删除",
                description: `确定要删除工作流「${B.name}」吗？此操作不可撤销。`,
                onConfirm: () => void Le(B.id, B.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(l, {
                size: "small",
                danger: !0,
                icon: J ? e.createElement(J) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), ot = F ? e.createElement(g) : z.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...z.map((B) => {
      const de = V[B.flow_id] || B.flow_id, ne = cn(B), Oe = Ho(B.node_statuses), Ce = Object.entries(B.node_statuses || {}), Fe = Ce.filter(([, Ne]) => ["success", "completed", "skipped", "cached"].includes(Ne)).length, Qe = Ce.filter(([, Ne]) => ["error", "failed"].includes(Ne)).length, at = Ce.length > 0, Ae = B.status === "completed" || B.status === "success", He = at ? Math.round(Fe / Ce.length * 100) : ne ? 18 : Ae ? 100 : 0, qe = Array.isArray(B.events) ? B.events.filter(
        (Ne) => !!Ne && typeof Ne == "object"
      ).slice(-100) : [], st = ye.has(B.run_id), We = B.duration_ms && B.duration_ms > 0 ? B.duration_ms : B.finished_at && B.started_at ? (B.finished_at - B.started_at) * 1e3 : ne && B.started_at ? (Date.now() / 1e3 - B.started_at) * 1e3 : 0;
      return e.createElement(
        s,
        {
          key: B.run_id,
          size: "small",
          style: {
            borderLeft: `3px solid ${Fn[B.status] === "green" ? "#52c41a" : Fn[B.status] === "red" ? "#ff4d4f" : "#1677ff"}`,
            transition: "box-shadow .2s ease"
          }
        },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            v,
            { color: Fn[B.status] || "default" },
            B.resumed_by_run_id ? "已恢复" : B.status
          ),
          e.createElement(U, { strong: !0 }, de),
          e.createElement(
            S,
            { title: B.run_id },
            e.createElement(
              U,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              B.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            U,
            { type: "secondary", style: { fontSize: 12 } },
            Go(B.started_at)
          ),
          We > 0 ? e.createElement(
            U,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Wo(We)}`
          ) : null,
          Oe ? e.createElement(v, { color: "geekblue", style: { fontSize: 11 } }, Oe) : null,
          B.error ? e.createElement(
            S,
            { title: B.error },
            e.createElement(U, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            ne ? e.createElement(
              u,
              {
                title: "确认取消运行？",
                onConfirm: () => void Ge(B.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(l, {
                size: "small",
                danger: !0,
                loading: Pe.has(B.run_id),
                icon: q ? e.createElement(q) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              l,
              {
                size: "small",
                type: "link",
                onClick: () => ve((Ne) => {
                  const Me = new Set(Ne);
                  return Me.has(B.run_id) ? Me.delete(B.run_id) : Me.add(B.run_id), Me;
                })
              },
              st ? "收起过程" : "查看过程"
            ),
            e.createElement(
              l,
              {
                size: "small",
                type: "link",
                onClick: () => Lt(void 0, B.run_id)
              },
              "查看详情"
            )
          )
        ),
        e.createElement(
          "div",
          { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 10 } },
          e.createElement(f, { percent: He, size: "small", status: Qe || B.status === "failed" || B.status === "error" ? "exception" : ne ? "active" : "success", showInfo: !1, style: { flex: 1, margin: 0 } }),
          e.createElement(U, { type: "secondary", style: { fontSize: 12, minWidth: 90, textAlign: "right" } }, at ? `${He}%` : "暂无节点进度")
        ),
        st && (Ce.length > 0 || qe.length > 0 || B.error) ? e.createElement(
          "div",
          { style: { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "var(--ant-color-fill-quaternary, #fafafa)" } },
          e.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
            e.createElement(U, { strong: !0 }, "协作过程"),
            e.createElement(U, { type: "secondary", style: { fontSize: 12 } }, Ce.length > 0 ? `${Fe}/${Ce.length} 个 Agent 节点完成${Qe ? ` · ${Qe} 个失败` : ""}` : "暂无节点状态")
          ),
          Ce.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 7 } },
            ...Ce.map(
              ([Ne, Me], ut) => e.createElement(
                "div",
                { key: Ne, style: { display: "flex", alignItems: "center", gap: 8 } },
                e.createElement("span", { style: { width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: Bt(Me) === "green" ? "#f6ffed" : Bt(Me) === "red" ? "#fff2f0" : "#e6f4ff", color: Bt(Me) === "green" ? "#389e0d" : Bt(Me) === "red" ? "#cf1322" : "#1677ff", fontSize: 11, fontWeight: 600 } }, ut + 1),
                e.createElement(U, { style: { flex: 1, fontSize: 12 } }, Ne.replace(/^step[_-]?\d+[_-]?/, "") || `Agent ${ut + 1}`),
                ut < Ce.length - 1 ? e.createElement(U, { type: "secondary", style: { fontSize: 11 } }, "→") : null,
                e.createElement(v, { color: Bt(Me), style: { margin: 0, fontSize: 11 } }, gi(Me))
              )
            )
          ) : null,
          qe.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 5, marginTop: Ce.length > 0 ? 10 : 0 } },
            e.createElement(U, { strong: !0, style: { fontSize: 12 } }, "执行事件"),
            ...qe.map((Ne, Me) => e.createElement(U, { key: `event-${Me}`, type: "secondary", style: { fontSize: 12 } }, qo(Ne, Me)))
          ) : null,
          B.error ? e.createElement(a, { type: "error", showIcon: !0, message: "运行错误", description: B.error, style: { marginTop: 10 } }) : null
        ) : null
      );
    })
  ), Ye = e.createElement(
    w,
    null,
    e.createElement(l, {
      icon: P ? e.createElement(P) : void 0,
      onClick: () => void se(),
      loading: F
    }, "刷新"),
    me !== "templates" ? e.createElement(l, {
      type: "primary",
      icon: R ? e.createElement(R) : j ? e.createElement(j) : void 0,
      onClick: () => Lt(),
      disabled: !le,
      style: Ke
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    le ? null : e.createElement(a, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    ue ? e.createElement(a, { type: "error", showIcon: !0, message: "方案未应用", description: ue, style: { marginBottom: 12 } }) : null,
    e.createElement(m, {
      title: "审查工作流方案",
      open: !!ae,
      width: 720,
      onCancel: () => {
        W || (G(null), N(""));
      },
      onOk: () => void $e(),
      okText: "应用并打开编辑器",
      cancelText: "放弃方案",
      confirmLoading: W === "apply",
      okButtonProps: { disabled: !(ae != null && ae.validation.ok) || !!W },
      cancelButtonProps: { disabled: !!W },
      closable: !W,
      maskClosable: !W
    }, ae ? e.createElement(
      w,
      { direction: "vertical", style: { width: "100%" } },
      e.createElement(a, {
        type: ae.validation.ok ? "success" : "error",
        showIcon: !0,
        message: ae.validation.ok ? "结构验证通过，请检查业务逻辑" : "方案未通过验证",
        description: ae.validation.errors.join("；") || "确认后保存流程，可在编辑器配置业务输入并试运行。"
      }),
      ...ae.warnings.map((B, de) => e.createElement(a, { key: `warning-${de}`, type: "warning", message: B })),
      e.createElement("ul", null, ...ae.changes.map((B, de) => e.createElement("li", { key: de }, B.description))),
      ue ? e.createElement(a, { type: "error", message: ue }) : null
    ) : null),
    e.createElement(y, {
      items: [
        { key: "templates", label: "工作流模板", children: rt },
        { key: "mine", label: `我的工作流 (${D.length})`, children: Ue },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            z.length,
            h ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${z.filter((B) => cn(B)).length} 活跃`
            ) : null,
            ")"
          ),
          children: ot
        }
      ],
      activeKey: me,
      onChange: (B) => Ie(B),
      tabBarExtraContent: Ye
    })
  );
}
function ca(e, t) {
  var i, a;
  const n = e.coordinatorName || ((i = e.members[0]) == null ? void 0 : i.name), r = e.members.find((l) => l.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((l) => l.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const l = mi(t, n);
    if (l) return l;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((a = t[0]) == null ? void 0 : a.id) || null;
}
function da() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Ko() {
  var Q, ye, ve, ke;
  const e = T().React, { useState: t, useEffect: n, useCallback: r, useMemo: i } = e, a = (ye = (Q = T()).useNavigate) == null ? void 0 : ye.call(Q), l = r((h) => {
    a ? a(h) : window.location.assign(h);
  }, [a]), {
    Spin: s,
    Empty: o,
    Input: d,
    Button: c,
    message: u,
    Tabs: m,
    Modal: p,
    Typography: w
  } = T().antd, {
    ReloadOutlined: g,
    PlusOutlined: y,
    SearchOutlined: f,
    TeamOutlined: v,
    UserOutlined: S
  } = T().antdIcons || {}, { Text: b, Paragraph: x } = w, [R, J] = t([]), [P, j] = t(!0), [X, q] = t(!1), [U, $] = t(null), [A, M] = t(""), [_, O] = t(!1), [D, Y] = t(da), [z, C] = t(
    null
  ), [te, re] = t(""), [F, L] = t(!1), [le, ie] = t(!1), [W, pe] = t(null), [ae, G] = t([]), ue = r(async () => {
    j(!0);
    try {
      const h = await An(), V = await Promise.all(
        h.map(async (I) => {
          try {
            const [se, ge, Ee] = await Promise.all([
              fr(I.id).catch(() => null),
              Pn(I.id).catch(() => []),
              hr(I.id).catch(() => [])
            ]);
            return {
              agent: I,
              config: se,
              skills: ge,
              mcps: Ee,
              loading: !1
            };
          } catch {
            return {
              agent: I,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      J(V), G(h);
    } catch (h) {
      u.error(h.message || "加载专家列表失败"), J([]);
    } finally {
      j(!1);
    }
  }, []);
  n(() => {
    ue();
  }, [ue]), n(() => {
    const h = () => Y(da());
    return window.addEventListener("popstate", h), () => window.removeEventListener("popstate", h);
  }, []), n(() => {
    if (W && le) {
      const h = R.find((V) => V.agent.id === W.agent.id);
      h && h !== W && pe(h);
    }
  }, [R, W, le]);
  const N = r(
    async (h) => {
      var ge;
      const V = h.coordinatorName || ((ge = h.members[0]) == null ? void 0 : ge.name), I = ca(h, ae);
      if (!I) {
        const Ee = h.members.find(
          ($e) => $e.name === V
        );
        u.error(
          (Ee == null ? void 0 : Ee.bindingMode) === "fixed" ? `固定协调者「${V || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(h.taskTemplate)) {
        re(h.taskTemplate), C(h);
        return;
      }
      await k(h, I, h.taskTemplate);
    },
    [ae, u]
  ), k = r(
    async (h, V, I) => {
      L(!0);
      try {
        const se = I || h.taskTemplate, ge = h.custom ? `@${h.id}` : h.name, Ee = `/ugsci-team ${h.mode} ${ge} ${se}`, $e = T();
        $e.setSelectedAgent && $e.setSelectedAgent(V);
        const Le = await To(V, Ee, h.name);
        u.success(`OMP 工作流已启动：${h.name}（${h.mode}模式）`), C(null), l(`/chat/${Le}`);
      } catch (se) {
        u.error(se.message || "发起团队任务失败");
      } finally {
        L(!1);
      }
    },
    [u, l]
  ), oe = r((h) => {
    $(h), q(!0);
  }, []), he = r((h) => {
    pe(h), ie(!0);
  }, []), xe = r(
    (h) => {
      if (!h.agent.enabled) {
        u.warning(`专家「${h.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        if (h.agent.managed_by_app) {
          l(`/apps/${encodeURIComponent(h.agent.managed_by_app)}`);
          return;
        }
        if (h.agent.available_in_chat === !1)
          throw new Error("此专家不支持通用聊天，请从所属应用打开");
        const V = T();
        if (!V.setSelectedAgent) throw new Error("当前版本不支持切换专家，请更新软件后重试");
        V.setSelectedAgent(h.agent.id), sessionStorage.setItem("qwenpaw_pending_new_chat", "1"), l("/chat"), u.success(`已召唤专家「${h.agent.name}」`);
      } catch (V) {
        sessionStorage.removeItem("qwenpaw_pending_new_chat"), console.warn("[ugsci] Failed to set selected agent:", V), u.error(V instanceof Error ? V.message : "召唤专家失败，请重试");
      }
    },
    [u, l]
  ), ze = i(() => {
    if (!A.trim()) return R;
    const h = A.toLowerCase();
    return R.filter(
      (V) => {
        var I;
        return V.agent.name.toLowerCase().includes(h) || ((I = V.agent.description) == null ? void 0 : I.toLowerCase().includes(h)) || V.agent.id.toLowerCase().includes(h) || V.skills.some((se) => se.name.toLowerCase().includes(h));
      }
    );
  }, [R, A]), Se = R.filter((h) => h.agent.enabled).length, me = R.reduce(
    (h, V) => h + V.skills.filter((I) => I.enabled !== !1).length,
    0
  ), Ie = R.reduce((h, V) => h + V.mcps.length, 0), Pe = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        S ? e.createElement(S, { style: { fontSize: 14 } }) : null,
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
            value: A,
            onChange: (h) => M(h.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            c,
            {
              type: "primary",
              icon: y ? e.createElement(y) : void 0,
              onClick: () => O(!0),
              style: Ke
            },
            "创建专家"
          )
        ),
        // Content
        P ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(s, { size: "large" })
        ) : ze.length === 0 ? e.createElement(o, {
          description: A ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
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
          ...ze.map(
            (h) => e.createElement(
              "div",
              {
                key: h.agent.id,
                style: { display: "flex", minWidth: 0 }
              },
              e.createElement(fo, {
                expert: h,
                onClick: () => oe(h),
                onSummon: () => xe(h),
                onConfigure: () => he(h)
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
        v ? e.createElement(v, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Uo, {
        agents: ae,
        onLaunch: N
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (ve = T().antdIcons) != null && ve.ApartmentOutlined ? e.createElement(T().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Jo)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(zn, {
      title: "专家·协作",
      subtitle: D === "experts" ? `共 ${R.length} 位专家（${Se} 位启用）· ${me} 个技能 · ${Ie} 个 MCP 客户端` : D === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        D === "experts" ? e.createElement(
          c,
          {
            icon: g ? e.createElement(g) : void 0,
            onClick: () => {
              tn(), ue();
            },
            loading: P
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(m, {
      items: Pe,
      activeKey: D,
      onChange: (h) => {
        Y(h);
        const V = new URL(window.location.href);
        h === "experts" ? V.searchParams.delete("section") : V.searchParams.set("section", h), window.history.pushState({}, "", `${V.pathname}${V.search}`);
      }
    }),
    // Drawer
    e.createElement(go, {
      onSummon: xe,
      expert: U,
      open: X,
      onClose: () => q(!1),
      onRefresh: () => ue()
    }),
    // Template Modal
    e.createElement(yo, {
      open: _,
      onClose: () => O(!1),
      onCreated: () => ue()
    }),
    // Config Modal (gear icon)
    e.createElement(uo, {
      expert: W,
      open: le,
      onClose: () => ie(!1),
      onRefresh: () => ue()
    }),
    // Team Launch Modal (for filling placeholders)
    z ? e.createElement(
      p,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(br, {
            members: z.members.map((h) => h.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${z.name}`
          )
        ),
        onCancel: () => C(null),
        onOk: () => {
          const h = ca(
            z,
            ae
          );
          if (!h) {
            u.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const V = te.trim() || z.taskTemplate;
          k(z, h, V);
        },
        confirmLoading: F,
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
        e.createElement(d.TextArea, {
          value: te,
          onChange: (h) => re(h.target.value),
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
          `协调者: ${z.coordinatorName || ((ke = z.members[0]) == null ? void 0 : ke.name) || "—"} · 成员: ${z.members.map((h) => h.name).join("、")}`
        )
      )
    ) : null
  );
}
function Xo({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const i = T().React, { useState: a, useEffect: l, useCallback: s } = i, {
    Spin: o,
    Empty: d,
    Button: c,
    Row: u,
    Col: m,
    Card: p,
    Tag: w,
    Checkbox: g,
    Modal: y,
    Typography: f,
    Drawer: v,
    Descriptions: S,
    message: b
  } = T().antd, {
    ReloadOutlined: x,
    ThunderboltOutlined: R,
    SettingOutlined: J,
    CheckSquareOutlined: P,
    EyeOutlined: j,
    EyeInvisibleOutlined: X,
    DeleteOutlined: q,
    CloseOutlined: U
  } = T().antdIcons || {}, { Text: $, Paragraph: A } = f, [M, _] = a([]), [O, D] = a(!0), [Y, z] = a(!1), [C, te] = a(null), [re, F] = a(!1), [L, le] = a(
    /* @__PURE__ */ new Set()
  ), [ie, W] = a(!1), [pe, ae] = a(null), [G, ue] = a(!1), N = s(async () => {
    if (e) {
      D(!0);
      try {
        const Q = await Pn(e);
        _(Q);
      } catch (Q) {
        b.error(Q.message || "加载技能失败"), _([]);
      } finally {
        D(!1);
      }
    }
  }, [e]);
  l(() => {
    N();
  }, [N, n]);
  const k = (Q) => {
    le((ye) => {
      const ve = new Set(ye);
      return ve.has(Q) ? ve.delete(Q) : ve.add(Q), ve;
    });
  }, oe = () => le(/* @__PURE__ */ new Set()), he = () => le(new Set(M.map((Q) => Q.name))), xe = () => {
    re ? (oe(), F(!1)) : F(!0);
  }, ze = async () => {
    const Q = Array.from(L);
    if (Q.length !== 0) {
      W(!0);
      try {
        const { results: ye } = await Dl(e, Q), ve = Object.entries(ye).filter(
          ([, h]) => h.success === !1
        ), ke = Q.length - ve.length;
        ve.length > 0 ? b.warning(
          `批量启用完成：成功 ${ke} 个，失败 ${ve.length} 个`
        ) : b.success(`成功启用 ${Q.length} 个技能`), oe(), await N();
      } catch (ye) {
        b.error(ye.message || "批量启用失败");
      } finally {
        W(!1);
      }
    }
  }, Se = async () => {
    const Q = Array.from(L);
    if (Q.length !== 0) {
      W(!0);
      try {
        const { results: ye } = await Fl(e, Q), ve = Object.entries(ye).filter(
          ([, h]) => h.success === !1
        ), ke = Q.length - ve.length;
        ve.length > 0 ? b.warning(
          `批量停用完成：成功 ${ke} 个，失败 ${ve.length} 个`
        ) : b.success(`成功停用 ${Q.length} 个技能`), oe(), await N();
      } catch (ye) {
        b.error(ye.message || "批量停用失败");
      } finally {
        W(!1);
      }
    }
  }, me = () => {
    const Q = Array.from(L);
    Q.length !== 0 && y.confirm({
      title: `确认删除 ${Q.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        W(!0);
        try {
          const { results: ye } = await Gl(e, Q), ve = Object.entries(ye).filter(
            ([, h]) => h.success === !1
          ), ke = Q.length - ve.length;
          ve.length > 0 ? b.warning(
            `批量删除完成：成功 ${ke} 个，失败 ${ve.length} 个`
          ) : b.success(`成功删除 ${Q.length} 个技能`), oe(), await N();
        } catch (ye) {
          b.error(ye.message || "批量删除失败");
        } finally {
          W(!1);
        }
      }
    });
  }, Ie = async (Q) => {
    ue(!0);
    try {
      Q.enabled === !1 ? (await ti(e, Q.name), b.success(`已启用技能「${Q.name}」`)) : (await ri(e, Q.name), b.success(`已禁用技能「${Q.name}」`)), await N();
    } catch (ye) {
      b.error(ye.message || "操作失败");
    } finally {
      ue(!1);
    }
  }, Pe = (Q) => {
    y.confirm({
      title: `确认删除技能「${Q.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ue(!0);
        try {
          await yr(e, Q.name), b.success(`已删除技能「${Q.name}」`), await N();
        } catch (ye) {
          b.error(ye.message || "删除失败");
        } finally {
          ue(!1);
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
        $,
        { type: "secondary", style: { fontSize: 13 } },
        re ? `已选择 ${L.size} / ${M.length} 个技能` : `共 ${M.length} 个技能`
      ),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        re ? i.createElement(
          i.Fragment,
          null,
          i.createElement(
            c,
            { size: "small", onClick: he },
            "全选"
          ),
          i.createElement(
            c,
            {
              size: "small",
              icon: U ? i.createElement(U) : void 0,
              onClick: oe
            },
            "取消选择"
          ),
          i.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: j ? i.createElement(j) : void 0,
              disabled: L.size === 0 || ie,
              loading: ie,
              onClick: ze
            },
            "批量启用"
          ),
          i.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: X ? i.createElement(X) : void 0,
              disabled: L.size === 0 || ie,
              loading: ie,
              onClick: Se
            },
            "批量停用"
          ),
          i.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: q ? i.createElement(q) : void 0,
              disabled: L.size === 0 || ie,
              loading: ie,
              onClick: me
            },
            `删除 (${L.size})`
          ),
          i.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: xe
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
              icon: P ? i.createElement(P) : void 0,
              onClick: xe,
              disabled: M.length === 0
            },
            "批量管理"
          ),
          i.createElement(
            c,
            {
              icon: x ? i.createElement(x) : void 0,
              onClick: () => {
                tn(), N();
              }
            },
            "刷新"
          )
        )
      )
    ),
    O ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      i.createElement(o, { size: "large" })
    ) : M.length === 0 ? i.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : i.createElement(
      u,
      { gutter: [12, 12] },
      ...M.map(
        (Q) => i.createElement(
          m,
          { key: Q.name, xs: 24, sm: 12, md: 8, lg: 6 },
          i.createElement(
            p,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: re ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: re && L.has(Q.name) ? "#0072f5" : void 0,
                borderWidth: re && L.has(Q.name) ? 2 : 1
              },
              onClick: () => {
                re ? k(Q.name) : (te(Q), z(!0));
              },
              onMouseEnter: () => {
                re || ae(Q.name);
              },
              onMouseLeave: () => ae(null)
            },
            re ? i.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (ye) => {
                  ye.stopPropagation(), k(Q.name);
                }
              },
              i.createElement(g, {
                checked: L.has(Q.name)
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
                $,
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
                w,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : i.createElement(
                w,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            Q.description ? i.createElement(
              A,
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
                w,
                { style: { fontSize: 10 } },
                `v${Q.version_text}`
              ) : null,
              ...(Q.tags || []).slice(0, 3).map(
                (ye, ve) => i.createElement(
                  w,
                  { key: ve, color: "blue", style: { fontSize: 10 } },
                  ye
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !re && pe === Q.name ? i.createElement(
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
                  icon: Q.enabled === !1 ? j ? i.createElement(j) : void 0 : X ? i.createElement(X) : void 0,
                  disabled: G,
                  onClick: (ye) => {
                    ye.stopPropagation(), Ie(Q);
                  }
                },
                Q.enabled === !1 ? "启用" : "禁用"
              ),
              i.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: q ? i.createElement(q) : void 0,
                  disabled: G,
                  onClick: (ye) => {
                    ye.stopPropagation(), Pe(Q);
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
    C ? i.createElement(
      v,
      {
        title: i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          i.createElement(
            "span",
            { style: { fontSize: 18 } },
            C.emoji || "⚡"
          ),
          i.createElement("span", null, C.name)
        ),
        open: Y,
        onClose: () => z(!1),
        width: 520,
        extra: i.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: J ? i.createElement(J) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      i.createElement(
        S,
        { column: 1, bordered: !0, size: "small" },
        i.createElement(
          S.Item,
          { label: "技能名称" },
          C.name
        ),
        i.createElement(
          S.Item,
          { label: "描述" },
          C.description || "-"
        ),
        C.version_text ? i.createElement(
          S.Item,
          { label: "版本" },
          C.version_text
        ) : null,
        i.createElement(
          S.Item,
          { label: "来源" },
          C.source || "-"
        ),
        i.createElement(
          S.Item,
          { label: "状态" },
          C.enabled === !1 ? "已禁用" : "已启用"
        ),
        C.installed_from ? i.createElement(
          S.Item,
          { label: "安装来源" },
          C.installed_from
        ) : null
      ),
      // Tags
      C.tags && C.tags.length > 0 ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          $,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        i.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...C.tags.map(
            (Q, ye) => i.createElement(w, { key: ye, color: "blue" }, Q)
          )
        )
      ) : null,
      // Skill content preview
      C.content ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          $,
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
          C.content.slice(0, 2e3) + (C.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Yo({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: i,
  onSkillInstalled: a,
  agentId: l,
  agentName: s
}) {
  const o = T().React, { useState: d, useMemo: c, useCallback: u, useEffect: m, useRef: p } = o, {
    Spin: w,
    Empty: g,
    Input: y,
    Button: f,
    Row: v,
    Col: S,
    Card: b,
    Tag: x,
    Typography: R,
    Drawer: J,
    Descriptions: P,
    List: j,
    Modal: X,
    message: q
  } = T().antd, {
    ReloadOutlined: U,
    SearchOutlined: $,
    DownloadOutlined: A,
    ThunderboltOutlined: M,
    DeleteOutlined: _,
    PlusOutlined: O
  } = T().antdIcons || {}, { Text: D, Paragraph: Y } = R, [z, C] = d(""), [te, re] = d(!1), [F, L] = d(null), [le, ie] = d([]), [W, pe] = d(!1), [ae, G] = d(24), [ue, N] = d(null), [k, oe] = d(!1), he = p(0), xe = p(null), ze = c(
    () => {
      var I;
      return new Set(
        ((I = t.find((se) => se.agent_id === l)) == null ? void 0 : I.skill_names) || []
      );
    },
    [t, l]
  ), Se = c(() => {
    if (!z.trim()) return e;
    const I = z.toLowerCase();
    return e.filter(
      (se) => {
        var ge, Ee;
        return se.name.toLowerCase().includes(I) || ((ge = se.description) == null ? void 0 : ge.toLowerCase().includes(I)) || ((Ee = se.tags) == null ? void 0 : Ee.some(($e) => $e.toLowerCase().includes(I)));
      }
    );
  }, [e, z]), me = c(
    () => Se.slice(0, ae),
    [Se, ae]
  );
  m(() => {
    if (me.length >= Se.length) return;
    const I = xe.current;
    if (!I) return;
    const se = () => {
      G(
        (Ee) => Math.min(Ee + 24, Se.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const Ee = new IntersectionObserver(
        ($e) => {
          $e.some((Le) => Le.isIntersecting) && se();
        },
        { rootMargin: "240px 0px" }
      );
      return Ee.observe(I), () => Ee.disconnect();
    }
    const ge = () => {
      I.getBoundingClientRect().top <= window.innerHeight + 240 && se();
    };
    return window.addEventListener("scroll", ge, { passive: !0 }), ge(), () => window.removeEventListener("scroll", ge);
  }, [Se.length, me.length]);
  const Ie = u((I) => {
    C(I), G(24);
  }, []), Pe = u(() => {
    const I = he.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: I, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = I);
    });
  }, []), Q = u(async () => {
    var I;
    he.current = ((I = document.scrollingElement) == null ? void 0 : I.scrollTop) ?? window.scrollY ?? 0;
    try {
      await i();
    } finally {
      Pe();
    }
  }, [i, Pe]), ye = u(
    (I) => {
      const se = [];
      for (const ge of t)
        if (ge.skill_names.includes(I)) {
          const Ee = n.find(($e) => $e.id === ge.agent_id);
          se.push((Ee == null ? void 0 : Ee.name) || ge.agent_name || ge.agent_id);
        }
      return se;
    },
    [t, n]
  ), ve = u(
    async (I) => {
      if (L(I), ie(ye(I.name)), re(!0), !I.content) {
        pe(!0);
        try {
          const se = await Ol(I.name);
          L({ ...I, content: se });
        } catch {
        } finally {
          pe(!1);
        }
      }
    },
    [ye]
  );
  m(() => {
    F && ie(ye(F.name));
  }, [F, ye, t]);
  const ke = async (I) => {
    oe(!0);
    try {
      await gr(l, I.name), q.success(
        `已将技能「${I.name}」加载到当前专家「${s}」`
      ), a(I);
    } catch (se) {
      q.error(se.message || "加载技能失败");
    } finally {
      oe(!1);
    }
  }, h = (I) => {
    if (I.protected) {
      q.warning("内置技能不可删除");
      return;
    }
    X.confirm({
      title: `确认从技能池删除「${I.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        oe(!0);
        try {
          await Hl(I.name), q.success(`已从技能池删除「${I.name}」`), await Q();
        } catch (se) {
          q.error(se.message || "删除失败");
        } finally {
          oe(!1);
        }
      }
    });
  }, V = (I) => {
    window.history.pushState({}, "", I), window.dispatchEvent(new PopStateEvent("popstate"));
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
        prefix: $ ? o.createElement($) : void 0,
        value: z,
        onChange: (I) => Ie(I.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          f,
          {
            icon: U ? o.createElement(U) : void 0,
            onClick: Q,
            loading: r,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          f,
          {
            type: "primary",
            icon: A ? o.createElement(A) : void 0,
            onClick: () => V("/skill-pool"),
            size: "small",
            style: Ke
          },
          "管理技能池"
        )
      )
    ),
    r ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(w, { size: "large" })
    ) : Se.length === 0 ? o.createElement(g, {
      description: z ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        v,
        { gutter: [12, 12] },
        ...me.map(
          (I) => o.createElement(
            S,
            { key: I.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              b,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ve(I),
                onMouseEnter: () => N(I.name),
                onMouseLeave: () => N(null)
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
                I.emoji ? o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  I.emoji
                ) : o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                o.createElement(
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
                  I.name
                ),
                I.protected ? o.createElement(
                  x,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              I.description ? o.createElement(
                Y,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                I.description
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
                I.version_text ? o.createElement(
                  x,
                  { style: { fontSize: 10 } },
                  `v${I.version_text}`
                ) : null,
                ...(I.tags || []).slice(0, 3).map(
                  (se, ge) => o.createElement(
                    x,
                    { key: ge, color: "cyan", style: { fontSize: 10 } },
                    se
                  )
                )
              ),
              // Hover action footer
              ue === I.name ? o.createElement(
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
                    icon: O ? o.createElement(O) : void 0,
                    disabled: k || ze.has(I.name),
                    onClick: (se) => {
                      se.stopPropagation(), ke(I);
                    }
                  },
                  ze.has(I.name) ? "已加载" : "加载到当前Agent"
                ),
                o.createElement(
                  f,
                  {
                    size: "small",
                    danger: !0,
                    icon: _ ? o.createElement(_) : void 0,
                    disabled: k || I.protected,
                    onClick: (se) => {
                      se.stopPropagation(), h(I);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        me.length < Se.length ? o.createElement(
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
          o.createElement(
            D,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${Se.length - me.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    F ? o.createElement(
      J,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            F.emoji || "⚡"
          ),
          o.createElement("span", null, F.name)
        ),
        open: te,
        onClose: () => re(!1),
        width: 520,
        extra: o.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: M ? o.createElement(M) : void 0,
            onClick: () => V("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        P,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          P.Item,
          { label: "技能名称" },
          F.name
        ),
        o.createElement(
          P.Item,
          { label: "描述" },
          F.description || "-"
        ),
        F.version_text ? o.createElement(
          P.Item,
          { label: "版本" },
          F.version_text
        ) : null,
        o.createElement(
          P.Item,
          { label: "来源" },
          F.source || "-"
        ),
        o.createElement(
          P.Item,
          { label: "受保护" },
          F.protected ? "是（内置）" : "否"
        ),
        F.sync_status ? o.createElement(
          P.Item,
          { label: "同步状态" },
          F.sync_status
        ) : null,
        F.installed_from ? o.createElement(
          P.Item,
          { label: "安装来源" },
          F.installed_from
        ) : null
      ),
      // Tags
      F.tags && F.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          D,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...F.tags.map(
            (I, se) => o.createElement(x, { key: se, color: "cyan" }, I)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          D,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${le.length})`
        ),
        le.length > 0 ? o.createElement(j, {
          size: "small",
          dataSource: le,
          renderItem: (I) => o.createElement(
            j.Item,
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
              o.createElement(dt, { name: I, size: 20 }),
              o.createElement(
                D,
                { style: { fontSize: 13 } },
                I
              )
            )
          )
        }) : o.createElement(
          D,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      W ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(w, { size: "small" })
      ) : F.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          D,
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
          F.content.slice(0, 2e3) + (F.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Qo({
  embedded: e = !1
} = {}) {
  const t = T().React, { useState: n, useEffect: r, useCallback: i, useMemo: a } = t, { Tabs: l, message: s } = T().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = T().antdIcons || {}, u = T().useSelectedAgent, m = u ? u() : null, p = (m == null ? void 0 : m.id) || "default";
  r(() => {
    pr();
  }, [p]);
  const [w, g] = n([]), [y, f] = n([]), [v, S] = n([]), [b, x] = n(!0), [R, J] = n("agent-skills"), [P, j] = n(0), X = i(async () => {
    x(!0);
    try {
      const [_, O, D] = await Promise.all([
        Rn(!0),
        An(),
        Ml()
      ]);
      f(_), g(O), S(D);
    } catch (_) {
      s.error(_.message || "加载技能列表失败"), f([]);
    } finally {
      x(!1);
    }
  }, []);
  r(() => {
    X();
  }, [X]);
  const q = a(() => {
    const _ = w.find((O) => O.id === p);
    return (_ == null ? void 0 : _.name) || p;
  }, [w, p]), U = i(
    (_) => {
      S(
        (O) => O.some((D) => D.agent_id === p) ? O.map((D) => D.agent_id !== p || D.skill_names.includes(_.name) ? D : {
          ...D,
          skill_names: [...D.skill_names, _.name]
        }) : [
          ...O,
          {
            agent_id: p,
            agent_name: q,
            skill_names: [_.name]
          }
        ]
      ), j((O) => O + 1);
    },
    [p, q]
  ), $ = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
  }, A = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? t.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Xo, {
        agentId: p,
        agentName: q,
        refreshKey: P,
        onNavigate: $
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
      children: t.createElement(Yo, {
        poolSkills: y,
        workspaceSkills: v,
        agents: w,
        loading: b,
        onReload: X,
        onSkillInstalled: U,
        agentId: p,
        agentName: q
      })
    }
  ], M = t.createElement(l, {
    items: A,
    activeKey: R,
    onChange: (_) => J(_)
  });
  return e ? M : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(zn, {
      title: "技能",
      subtitle: `技能池共 ${y.length} 个技能 · 当前智能体：${q}`
    }),
    M
  );
}
const Qn = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, yi = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, hi = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Ei(e) {
  return In(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Zo() {
  return ce("/ugsci/engines/list");
}
async function es(e) {
  return ce("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function ts(e, t) {
  return ce(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function ns(e) {
  return ce(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function rs() {
  return ce("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function as({
  engine: e,
  onClick: t
}) {
  const n = T().React, { Card: r, Tag: i, Typography: a } = T().antd, { Text: l } = a, s = e.status === "detected", o = yi[e.category] || "📦", c = hi.has(e.id) ? n.createElement("img", {
    src: Ei(e.id),
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
        c,
        n.createElement(
          "div",
          null,
          n.createElement(
            l,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          n.createElement("br"),
          n.createElement(
            l,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        s ? n.createElement(
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
        l,
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
        Qn[e.category] || e.category
      ) : null,
      e.version ? n.createElement(
        i,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (u) => n.createElement(
          i,
          { key: u, color: "cyan", style: { fontSize: 10 } },
          u
        )
      )
    )
  );
}
function is() {
  const e = T().React, { useState: t, useEffect: n, useCallback: r, useMemo: i } = e, {
    Spin: a,
    Empty: l,
    Button: s,
    message: o,
    Row: d,
    Col: c,
    Drawer: u,
    Descriptions: m,
    Tag: p,
    Typography: w,
    Modal: g,
    Input: y,
    Select: f,
    Popconfirm: v,
    Space: S
  } = T().antd, {
    ReloadOutlined: b,
    SearchOutlined: x,
    PlusOutlined: R,
    EditOutlined: J,
    DeleteOutlined: P,
    CopyOutlined: j,
    ExperimentOutlined: X
  } = T().antdIcons || {}, { Text: q, Paragraph: U } = w, [$, A] = t([]), [M, _] = t(!0), [O, D] = t(""), [Y, z] = t(!1), [C, te] = t(null), [re, F] = t(!1), [L, le] = t(null), [ie, W] = t({}), [pe, ae] = t(!1), G = r(async () => {
    _(!0);
    try {
      const me = await Zo();
      A(me.engines || []);
    } catch (me) {
      o.error(me.message || "加载引擎列表失败"), A([]);
    } finally {
      _(!1);
    }
  }, []);
  n(() => {
    G();
  }, [G]);
  const ue = i(() => {
    if (!O.trim()) return $;
    const me = O.toLowerCase();
    return $.filter(
      (Ie) => {
        var Pe;
        return Ie.name.toLowerCase().includes(me) || Ie.vendor.toLowerCase().includes(me) || Ie.category.toLowerCase().includes(me) || ((Pe = Ie.description) == null ? void 0 : Pe.toLowerCase().includes(me));
      }
    );
  }, [$, O]);
  $.filter((me) => me.status === "detected").length;
  const N = r((me) => {
    navigator.clipboard.writeText(me).then(() => o.success("路径已复制")).catch(() => o.error("复制失败"));
  }, []), k = r(() => {
    le(null), W({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), F(!0);
  }, []), oe = r((me) => {
    le(me), W({ ...me }), F(!0), z(!1);
  }, []), he = r(async () => {
    var me;
    if (!((me = ie.name) != null && me.trim())) {
      o.warning("请输入引擎名称");
      return;
    }
    ae(!0);
    try {
      L ? (await ts(L.id, ie), o.success("引擎已更新")) : (await es(ie), o.success("引擎已添加")), F(!1), G();
    } catch (Ie) {
      o.error(Ie.message || "保存失败");
    } finally {
      ae(!1);
    }
  }, [ie, L, G]), xe = r(
    async (me) => {
      try {
        await ns(me), o.success("引擎已删除"), z(!1), G();
      } catch (Ie) {
        o.error(Ie.message || "删除失败");
      }
    },
    [G]
  ), ze = r(async () => {
    _(!0);
    try {
      const me = await rs();
      A(me.engines || []), o.success("自动检测完成");
    } catch (me) {
      o.error(me.message || "检测失败");
    } finally {
      _(!1);
    }
  }, []), Se = r(
    (me, Ie, Pe) => {
      const Q = ie[Ie] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          q,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          me
        ),
        Pe != null && Pe.select ? e.createElement(f, {
          value: Q || void 0,
          onChange: (ye) => W((ve) => ({ ...ve, [Ie]: ye })),
          style: { width: "100%" },
          options: Pe.select.options,
          allowClear: !0,
          placeholder: `选择${me}`
        }) : Pe != null && Pe.textarea ? e.createElement(y.TextArea, {
          value: Q,
          onChange: (ye) => W((ve) => ({ ...ve, [Ie]: ye.target.value })),
          rows: 3,
          placeholder: `输入${me}`
        }) : e.createElement(y, {
          value: Q,
          onChange: (ye) => W((ve) => ({ ...ve, [Ie]: ye.target.value })),
          placeholder: `输入${me}`
        })
      );
    },
    [ie]
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
        value: O,
        onChange: (me) => D(me.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        s,
        {
          icon: b ? e.createElement(b) : void 0,
          onClick: ze,
          loading: M
        },
        "自动检测"
      ),
      e.createElement(
        s,
        {
          type: "primary",
          icon: R ? e.createElement(R) : void 0,
          onClick: k,
          style: Ke
        },
        "添加引擎"
      )
    ),
    // Content
    M ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : ue.length === 0 ? e.createElement(l, {
      description: O ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...ue.map(
        (me) => e.createElement(
          c,
          {
            key: me.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(as, {
            engine: me,
            onClick: () => {
              te(me), z(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    C ? e.createElement(
      u,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            hi.has(C.id) ? e.createElement("img", {
              src: Ei(C.id),
              alt: C.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              yi[C.category] || "📦"
            )
          ),
          e.createElement("span", null, C.name)
        ),
        open: Y,
        onClose: () => z(!1),
        width: 520,
        extra: e.createElement(
          S,
          null,
          e.createElement(
            s,
            {
              size: "small",
              icon: J ? e.createElement(J) : void 0,
              onClick: () => oe(C)
            },
            "编辑"
          ),
          C.is_default ? null : e.createElement(
            v,
            {
              title: "确认删除此引擎？",
              description: C.name,
              onConfirm: () => xe(C.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              s,
              {
                size: "small",
                danger: !0,
                icon: P ? e.createElement(P) : void 0
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
          C.name
        ),
        e.createElement(
          m.Item,
          { label: "厂商" },
          C.vendor || "—"
        ),
        e.createElement(
          m.Item,
          { label: "分类" },
          C.category ? Qn[C.category] || C.category : "—"
        ),
        e.createElement(
          m.Item,
          { label: "状态" },
          e.createElement(
            p,
            {
              color: C.status === "detected" ? "success" : C.status === "not_found" ? "error" : "default"
            },
            C.status === "detected" ? "✅ 已检测" : C.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          m.Item,
          { label: "版本" },
          C.version || "—"
        ),
        C.executable_path ? e.createElement(
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
              C.executable_path
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "text",
                icon: j ? e.createElement(j) : void 0,
                onClick: () => N(C.executable_path)
              }
            )
          )
        ) : null,
        C.install_dir ? e.createElement(
          m.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            C.install_dir
          )
        ) : null,
        // Display detected modules with paths
        C.modules && C.modules.length > 0 ? e.createElement(
          m.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...C.modules.map(
              (me) => e.createElement(
                "div",
                {
                  key: me,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  p,
                  { color: "cyan", style: { fontSize: 11 } },
                  me
                ),
                C.module_paths && C.module_paths[me] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  C.module_paths[me]
                ) : null
              )
            )
          )
        ) : null,
        C.license_server ? e.createElement(
          m.Item,
          { label: "许可证服务器" },
          C.license_server
        ) : null,
        e.createElement(
          m.Item,
          { label: "描述" },
          C.description || "—"
        )
      ),
      // Invocation hint
      C.invocation_hint ? e.createElement(
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
          q,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          C.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        C.is_default ? e.createElement(
          p,
          { color: "blue" },
          "默认引擎"
        ) : C.is_custom ? e.createElement(
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
        title: L ? "编辑引擎" : "添加引擎",
        open: re,
        onOk: he,
        onCancel: () => F(!1),
        okText: L ? "保存" : "添加",
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
            options: Object.entries(Qn).map(([me, Ie]) => ({
              label: Ie,
              value: me
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
async function ls(e = !1) {
  const t = await ce(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function os(e = !1) {
  return ce(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function ss() {
  return ce("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function cs(e) {
  return ce(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
function Zn(e) {
  return ce(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/runtime`,
    { bypassCache: !0 }
  );
}
function ds(e) {
  return ce(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/install`,
    { method: "POST" }
  );
}
function us(e) {
  return ce(
    `/ugsci/domain-engines/install-tasks/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function ms(e, t = !1) {
  const n = await ce("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function ps(e, t = !1) {
  const n = /* @__PURE__ */ new Map(), r = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let i;
  try {
    i = await ce("/mcp", r) || [];
  } catch {
    return n;
  }
  for (const a of i) {
    const l = a.key;
    if (!a.enabled) {
      n.set(l, { key: l, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const s = await ce(
        `/mcp/tools/${encodeURIComponent(l)}`,
        r
      ) || [];
      n.set(l, {
        key: l,
        enabled: !0,
        toolCount: s.filter((o) => o.enabled).length,
        error: null
      });
    } catch (s) {
      n.set(l, {
        key: l,
        enabled: !0,
        toolCount: 0,
        error: s instanceof Error ? s.message : "Tool query failed"
      });
    }
  }
  return n;
}
function ua(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function ma(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function fs(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, i = e.dependency_status;
  let a, l = "", s, o;
  if (r.provider.kind === "driver")
    i.overall === "unavailable" ? a = "needs_install" : i.overall !== "available" ? a = "unknown" : a = ma(t), s = (t == null ? void 0 : t.toolCount) ?? 0, o = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const d = ua(i), c = [
      ...new Set(r.operations.flatMap((g) => g.tool_names))
    ], u = c.filter(
      (g) => n.has(g)
    ), m = u.filter(
      (g) => {
        var y;
        return (y = n.get(g)) == null ? void 0 : y.enabled;
      }
    );
    d !== "available" ? a = d : u.length !== c.length ? a = "error" : m.length === 0 ? a = "unconfigured" : m.length < c.length ? a = "partial" : a = "available", s = m.length, o = null;
    const p = c.filter((g) => !n.has(g)), w = u.filter(
      (g) => {
        var y;
        return !((y = n.get(g)) != null && y.enabled);
      }
    );
    d === "available" && (l = p.length ? `工具未完整注册：${p.join("、")}` : w.length ? `当前专家已启用 ${m.length}/${c.length} 个工具；未启用：${w.join("、")}` : c.length ? `依赖检测通过，当前专家已启用全部 ${c.length} 个工具。` : "该能力未声明可调用工具。");
  } else r.source === "mcp" ? (a = ma(t), s = (t == null ? void 0 : t.toolCount) ?? 0, o = (t == null ? void 0 : t.key) ?? r.provider.id) : (a = ua(i), s = 0, o = null, l = "依据运行依赖检测结果判断，尚未校验当前专家的调用工具。");
  if (i.overall !== "available") {
    const d = i.dependencies.filter(
      (c) => c.status !== "available"
    );
    l = d.length ? d.map(
      (c) => `${c.name}：${c.status === "unavailable" ? "未检测到可用依赖" : "尚未确认"}${c.reason ? `（${c.reason}）` : ""}`
    ).join("；") : "尚未确认运行依赖状态，请刷新检测。";
  } else l || (l = t ? t.enabled ? t.error ? `MCP 工具查询失败：${t.error}` : t.toolCount > 0 ? `依赖检测通过，MCP 服务已启用并发现 ${t.toolCount} 个已启用工具；具体函数以服务实际提供为准。` : "MCP 服务已启用，但未发现已启用的工具。" : "当前专家尚未启用该 MCP 服务。" : "未发现当前专家的 MCP 服务配置，或服务状态查询未成功。");
  return {
    definition: r,
    dependencyStatus: i,
    checkedAt: e.checked_at,
    effectiveStatus: a,
    statusDescription: l,
    discoveredToolCount: s,
    mcpProviderKey: o
  };
}
const er = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  partial: "部分可用",
  error: "错误"
}, tr = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  partial: "warning",
  error: "error"
}, we = (e, t, n, r) => ({ inputs: e, outputs: t, description: n, limitations: r }), bi = {
  "welllog.las.read": we(
    "path：LAS 文件路径；encoding：文件编码（默认自动）；sample_rows：首尾采样行数（默认 20，最大 200）。",
    "包含井/曲线元数据、曲线摘要、采样数据和 QC 警告的 JSON。",
    "读取 LAS 文件并返回元数据和采样行。"
  ),
  "welllog.quality.validate": we(
    "path：LAS 文件路径；encoding：文件编码（默认自动）。",
    "包含通过/失败状态、错误、警告和逐项检查结果的 QC 报告 JSON。",
    "校验 LAS 文件质量。"
  ),
  "welllog.las.export": we(
    "input_path：源 LAS 路径；output_path：目标 LAS 路径（须与源路径不同）；encoding：读写编码（默认 utf-8）。",
    "包含输出路径和工件引用的 JSON。",
    "规范化导出 .las 文件。",
    "仅支持 .las，输入和输出路径必须不同。"
  ),
  "production.decline.fit": we(
    "time：相对时间数值数组；rate：对应产量数组；time_unit：时间单位（如 month/day/year）；rate_unit：产量单位（如 bbl/d、m3/d）；model：auto/exponential/harmonic/hyperbolic（默认 auto）。",
    "fits（各模型的 model/qi/di/b、RMSE、MAE、R²、AIC、fit_start、fit_end）、recommended、is_auto、warnings。",
    "对给定时间和产量数组拟合 Arps 递减曲线。",
    "time 与 rate 数组须一一对应。"
  ),
  "production.decline.forecast": we(
    "model：exponential/harmonic/hyperbolic；qi：初始产量；di：初始递减率；b：双曲指数（双曲模型必需，其余忽略）；forecast_time：预测时间数组；time_unit、rate_unit：单位。",
    "result：model、qi、di、b、forecast（每项含 time、rate）；领域结果外层还含 units、metrics、assumptions、warnings、tolerances、applicability、provenance、artifacts。",
    "按递减模型参数预测指定时点产量。"
  ),
  "production.decline.eur": we(
    "model、qi、di、b、time_unit、rate_unit；forecast_end：预测截止时间（可选）；economic_limit：经济极限产量（可选，二者按工具约束使用）。",
    "result：model、qi、di、b、effective_end、final_rate、cumulative_production、economic_limit_used、forecast_end_used；外层含 units、metrics、assumptions、warnings 等领域结果字段。",
    "按时间边界或经济极限估算最终采收量。"
  ),
  "fluid.flash": we(
    "components：组分名到摩尔分数的映射；temperature：温度（默认单位 C）；pressure：压力（默认 bara）；temperature_unit（默认 C）、pressure_unit（默认 bara）、eos（默认 SRK）、flash_type（默认 TP）。",
    "NeqSim runFlash 返回值；集成不可用时返回 ok=false、error_type、message 等错误字段。",
    "调用已发现的 NeqSim runFlash 工具。",
    "需要工作区 NeqSim Driver 和服务端 runFlash 能力。"
  ),
  "fluid.pvt": we(
    "specification：PVT 实验规格对象或 JSON 字符串，原样序列化为 pvtJson。",
    "NeqSim runPVT 返回值；失败时返回 ok=false、error_type、message 和可选 metadata。",
    "调用 NeqSim runPVT 实验。",
    "需工作区 NeqSim Driver 提供 runPVT。"
  ),
  "fluid.phase_envelope": we(
    "components：组分名到摩尔分数的映射；eos：状态方程名称（默认 SRK）。",
    "NeqSim getPhaseEnvelope 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim getPhaseEnvelope。",
    "需工作区 NeqSim Driver 提供 getPhaseEnvelope。"
  ),
  "process.simulation": we(
    "process：流程规格对象或 JSON 字符串，序列化后传给 processJson。",
    "NeqSim runProcess 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim runProcess 流程模拟。",
    "需工作区 NeqSim Driver 提供 runProcess。"
  ),
  "pipeline.flow": we(
    "specification：管道规格对象或 JSON 字符串，序列化后传给 pipelineJson。",
    "NeqSim runPipeline 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim runPipeline 多相流计算。",
    "需工作区 NeqSim Driver 提供 runPipeline。"
  ),
  "math.symbolic": we(
    "coefficients：按最高次项到常数项排列的系数数组；首项不得为 0，至少 2 项。",
    "所有实根和复根及计算状态/诊断。",
    "求解多项式的数值根。",
    "最高次数不超过 20。"
  ),
  "statistics.bayesian": we(
    "observations：观测数值数组；prior_mean、prior_std：正态先验均值/标准差；observation_std：观测标准差；draws、tune：抽样数和调优步数；seed：随机种子。",
    "posterior_mean、posterior_std、credible_interval_95、sample_count。",
    "对正态均值模型执行贝叶斯估计。",
    "当前工具限定为正态均值估计模型。"
  ),
  "optimization.multi_objective": we(
    "centers：二次目标中心点数组；bounds：各变量上下界；population_size、generations：种群规模和迭代代数；seed：随机种子。",
    "result：solutions（每项含 variables、objectives）及 solution_count。",
    "优化工具定义的多目标二次问题。",
    "目标函数形式固定为工具实现的二次模型。"
  ),
  "simulation.discrete_event": we(
    "arrival_interval：到达间隔；service_time：服务时间；servers：服务台数量（默认 1，范围 1–100）；duration：仿真时长（默认 100，须为正；时间单位一致）。",
    "arrivals、completed、average_wait、maximum_wait、servers。",
    "模拟固定间隔到达、固定服务时长的 FIFO 队列。",
    "不计算利用率；到达间隔、服务时间和仿真时长须为正。"
  ),
  "graph.analysis": we(
    "nodes：节点名称数组；edges：由起点、终点组成的边数组；directed：是否有向；source、target：路径查询端点（可为空）。",
    "节点/边统计、连通性及可用的路径分析结果。",
    "分析给定图结构。",
    "仅分析传入的图，不自动读取外部网络数据。"
  ),
  "geospatial.analysis": we(
    "points：坐标数组，每项为 [x,y]；crs：输入坐标参考系（默认 EPSG:4326）。",
    "point_count、crs、bounds、centroid。",
    "对输入点集执行工具实现的空间分析。",
    "当前工具只接收点集，不能据此推断支持任意矢量处理。"
  ),
  "machine_learning.modeling": we(
    "features：训练特征二维数组；targets：目标值数组；predict_features：待预测特征二维数组。",
    "coefficients、intercept、training_r_squared、training_rmse、predictions。",
    "执行工具实现的回归建模与预测。",
    "当前接口是回归任务，不代表 scikit-learn 的分类、聚类等全部能力。"
  ),
  "statistics.modeling": we(
    "features：特征二维数组；targets：目标值数组；feature_names：特征名称数组。",
    "coefficients、standard_errors、p_values、r_squared、adjusted_r_squared、observation_count。",
    "执行工具实现的统计回归。",
    "当前接口限定于已实现的回归分析。"
  ),
  "units.convert": we(
    "value：标量数值；from_unit、to_unit：源单位和目标单位字符串。",
    "标准领域计算结果，result 中包含 value、from_unit、to_unit；外层含 units 和 applicability。",
    "在 UGSci 显式单位表内换算标量。",
    "源单位和目标单位必须属于同一受支持物理量纲。"
  ),
  "reservoir.volumetrics.oil_in_place": we(
    "area：面积；net_pay：净厚度；porosity、water_saturation：孔隙度/含水饱和度（比例）；oil_fvf：原油体积系数；area_unit（默认 acre）、length_unit（默认 ft）、output_unit（默认 stb）。",
    "OOIP 数值、输出单位及计算依据/输入摘要。",
    "容积法计算原始地质储量。"
  ),
  "reservoir.material_balance.oil": we(
    "必填 produced_oil、initial_oil_fvf、current_oil_fvf、initial_pressure、current_pressure；可选 produced_gor、initial_solution_gor、current_solution_gor、gas_fvf、produced_water、water_fvf、water_influx、initial_water_saturation、water_compressibility、rock_compressibility；volume_unit（默认 stb）、pressure_unit（psi）、compressibility_unit（1/psi）。",
    "估算 OOIP、物质平衡各项及计算状态。",
    "按输入 PVT 和水侵/压缩项执行油藏物质平衡。",
    "未提供的可选项使用模型默认值；结果取决于输入 PVT 与单位的一致性。"
  ),
  "reservoir.material_balance.gas_pz": we(
    "produced_gas、initial_pressure、initial_z_factor、current_pressure、current_z_factor；gas_volume_unit（默认 scf）、pressure_unit（默认 psi）。",
    "OGIP 估算及 p/z 计算量/状态。",
    "按 p/z 衰竭关系估算气藏原始地质储量。"
  ),
  "fluid.pvt.standing_black_oil": we(
    "pressure、temperature、oil_api、gas_specific_gravity、solution_gor_at_bubble_point；pressure_unit（默认 psi）、temperature_unit（默认 F）、gor_unit（默认 scf/stb）。",
    "Standing 关联式计算的泡点压力、溶解气油比和油体积系数。",
    "计算本地黑油 PVT 近似性质。",
    "采用 Standing 关联式，不是通用状态方程或组分模拟。"
  ),
  "production.ipr.vogel": we(
    "reservoir_pressure、test_flowing_pressure、test_rate；target_flowing_pressures：目标流压数组；pressure_unit（默认 psi）、rate_unit（默认 stb/d）。",
    "Vogel IPR 参数及各目标流压对应产能。",
    "基于测试点构建 Vogel 油井 IPR。"
  ),
  "production.nodal_analysis": we(
    "reservoir_pressure、test_flowing_pressure、test_rate、wellhead_pressure、hydrostatic_pressure、friction_pressure_at_test_rate；pressure_unit（psi）、rate_unit（stb/d）；tolerance（默认 1e-6）、max_iterations（默认 100）。",
    "求得的工作点产量/压力、迭代状态及节点计算摘要。",
    "求解当前简化 IPR/VLP 交点。",
    "VLP 由提供的压力项和工具模型表示，不替代完整多相管流模拟。"
  ),
  "validation.conservation_check": we(
    "initial_inventory、final_inventory：期初/期末库存；inflows、outflows：流入/流出数值数组；tolerance（默认 1e-6）；unit（默认 rb）。",
    "闭合误差、相对误差、是否在容差内及各项汇总。",
    "检查给定边界的质量/体积守恒。"
  ),
  "storage.inventory.accounting": we(
    "initial_inventory、cumulative_injected、cumulative_produced：库存及累计注采量；gas_volume_unit（默认 1e8_sm3）。",
    "期末账面库存、注采平衡量及校核信息。",
    "按统一体积单位执行库存计量平衡。"
  ),
  "storage.inventory.effective_controlled": we(
    "layers：分层数组，每层含 name、produced_gas、injection_end_pressure、injection_end_z、evaluation_pressure、evaluation_z；cycle_id、injection_end_state_id、evaluation_state_id；gas_volume_unit（1e8_sm3）、pressure_unit（MPa）、pressure_basis（absolute/apparent_formation/report_defined）；可选 denominator_relative_tolerance、maximum_inverse_withdrawal_fraction。",
    "result：effective_inventory、layers（逐层 name、produced_gas、injection_end_p_over_z、evaluation_p_over_z、p_over_z_depletion、withdrawal_fraction、inverse_withdrawal_fraction、effective_inventory）、cycle_id、injection_end_state_id、evaluation_state_id、pressure_basis、equation、quantity_definition、quality_gate；外层含 units、metrics、assumptions、warnings、applicability。",
    "按分层 p/Z 采气段公式计算有效控制库存。",
    "依赖输入压力基准与 Z 值；异常分母或超限反向采气比例会触发校验。"
  ),
  "storage.inventory.evaluate": we(
    "layers：分层数组，每层含 name、produced_gas、injection_end_pressure、injection_end_z、evaluation_pressure、evaluation_z；cycle_id、injection_end_state_id、evaluation_state_id、design_capacity 必填；book_inventory 与 initial_inventory/cumulative_injected/cumulative_produced 二选一；working_gas 与 design_working_gas 成对可选；peak_daily_rate 与 design_peak_daily_rate 成对可选；gas_volume_unit（默认 1e8_sm3）、pressure_unit（默认 MPa）、pressure_basis（默认 absolute；可选 apparent_formation/report_defined）、daily_rate_unit（默认 1e4_sm3/d）。",
    "effective_inventory、book_inventory、book_minus_effective_inventory、effective_minus_book_percent、design_capacity、effective_inventory_design_compliance_percent、book_inventory_fill_percent、effective_to_book_percent、book_inventory_source、review_status、review_reference、layers、quantity_separation、quality_gate；按输入条件附加 book_inventory_accounting、working_gas/design_working_gas/working_gas_compliance_percent、peak_daily_rate/design_peak_daily_rate/peak_daily_compliance_percent。",
    "分离计算账面库存、有效控制库存及可选工作气/冲峰指标，并标记待审核。",
    "结果始终为待审核计算建议，不表示已审批。"
  ),
  "storage.capacity.evaluate": we(
    "layers：每层 name、pore_volume、maximum_pressure、maximum_z、minimum_pressure、minimum_z、temperature；pore_volume_unit（m3）、pressure_unit（MPa）、temperature_unit（K）；standard_pressure（默认 0.101325）、standard_temperature（默认 288.15）、gas_volume_unit（1e8_sm3）。",
    "result：total_capacity、cushion_gas、working_gas、working_gas_fraction、layers（逐层 maximum_capacity/minimum_inventory/working_gas 等）、pressure_window、method、review_status、review_reference；外层含 units、metrics、assumptions、warnings、applicability。",
    "按孔隙体积和压力/Z 边界换算标准气量。",
    "属于边界筛选；不包含水侵、地质力学或产能能力模型。"
  ),
  "storage.injection_allocation.optimize": we(
    "wells：井组数组，含 name、maximum_rate、可选 minimum_rate（默认 0）、weight（默认 1）、available（默认 true）；target_rate；rate_unit（1e4_sm3/d）；require_feasible（默认 false）。",
    "目标/请求量、分配总量、未满足量、超配量、feasible、逐井 allocated_rate/constraint_status、method、review_status；并附单位、井数指标、假设、警告和适用范围。",
    "按可用井的最低量和权重上限填充分配目标。",
    "不计算井筒/地层物理响应；结果是边界内的分配方案。"
  ),
  "storage.production_allocation.optimize": we(
    "wells：井组数组，含 name、maximum_rate、可选 minimum_rate（默认 0）、weight（默认 1）、available（默认 true）；demand_rate；rate_unit（1e4_sm3/d）；require_feasible（默认 false）。",
    "需求/请求量、分配总量、未满足量、超配量、feasible、逐井 allocated_rate/constraint_status、method、review_status；并附单位、井数指标、假设、警告和适用范围。",
    "按可用井的最低量和权重上限填充分配需求。",
    "井组产能上下限由调用方提供；工具不计算井筒或地层产能。"
  ),
  "storage.scenario.optimize": we(
    "scenarios：候选数组，每项含 name、metrics（指标名到数值），metadata（可选字符串映射）；objectives：指标 key、direction（maximize/minimize）、weight；constraints（可选，key/operator/limit）；metric_unit（可选）。",
    "可行方案排序、目标评分、约束筛选与非支配 Pareto 方案。",
    "按显式目标和约束做透明方案比较。",
    "仅比较提供的标量指标，不运行储层仿真。"
  ),
  "visualization.open": we(
    "dataset_id：数据集标识（默认空字符串，表示不指定数据集）。",
    "排队命令回执：kind、commandId、command=open、datasetId；配置/队列异常时返回 kind=error 和 error。",
    "请求打开三维查看器并可选加载数据集。"
  ),
  "visualization.property": we(
    "property：属性名；dataset_id：数据集标识（默认空字符串）。",
    "排队命令回执：kind、commandId、command=set-property、property；异常时 kind=error/error。",
    "向查看器发送属性着色切换命令。"
  ),
  "visualization.benchmark": we(
    "无参数。",
    "排队基准命令回执：kind、commandId、command=benchmark；实际基准数据需查询/由查看器执行。",
    "请求查看器运行五秒渲染基准。"
  ),
  "storage.history.import": we(
    "input_path：本地文件或目录的路径。",
    "ok、dataset_id、records、facilities、quality_counts、quality_examples（最多 20 条）、source_columns、reused。",
    "导入本地储气库注采历史数据并检查质量。",
    "接受 XLS/XLSX/UTF-8 CSV 文件或目录；原件保留。"
  ),
  "storage.dynamics.analyze": we(
    "dataset_id：数据集 ID；facility、well：储气库/井原名（默认空，表示全部）；start、end：YYYY-MM-DD 起止日期（默认空，取全范围）；cycle_start_month：气年度起始月 1–12（默认 4）；drop_threshold_pct：同阶段末 7 日与前 7 日折算量下降筛查阈值百分比（默认 30）。",
    "ok、summary、coverage、cycles_recent、anomalies、forecast_wells、warnings、parameters、quality_counts、quality_examples、report_path、analysis_path。",
    "生成并保存可追溯的储气库动态分析报告。"
  ),
  "storage.history.list": we(
    "无参数。",
    "ok、datasets（每项含 id、name、records、facilities、quality_counts、quality_examples）及 quality_code_meaning。",
    "列出已导入储气库历史数据集。"
  )
}, Wt = {
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
function vi(e) {
  const t = bi[e.id];
  return {
    description: (t == null ? void 0 : t.description) || e.description || "暂无说明",
    inputs: (t == null ? void 0 : t.inputs) || "输入信息未提供",
    outputs: (t == null ? void 0 : t.outputs) || "输出信息未提供",
    limitations: t == null ? void 0 : t.limitations
  };
}
function wi({
  operations: e
}) {
  const t = T().React, { Tag: n, Typography: r } = T().antd, { Text: i } = r;
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 8, minWidth: 0 } },
    ...e.map((a) => {
      const l = vi(a);
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
          l.description
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
          `输入：${l.inputs}`
        ),
        t.createElement(
          i,
          {
            type: "secondary",
            style: { display: "block", fontSize: 12, overflowWrap: "anywhere" }
          },
          `输出：${l.outputs}`
        ),
        l.limitations ? t.createElement(
          i,
          {
            type: "warning",
            style: {
              display: "block",
              fontSize: 12,
              overflowWrap: "anywhere"
            }
          },
          `限制：${l.limitations}`
        ) : null,
        bi[a.id] ? null : t.createElement(
          n,
          { style: { marginTop: 4 } },
          "详细说明待补充"
        )
      );
    })
  );
}
const gs = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  reservoir_engineering: "🛢️",
  underground_gas_storage: "🛢️",
  gas_storage: "🛢️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
};
function ys({
  view: e,
  onDetails: t,
  onInstall: n,
  onConfigure: r,
  onRefresh: i,
  installTask: a
}) {
  const l = T().React, { Card: s, Tag: o, Typography: d, Button: c, Modal: u, Tooltip: m } = T().antd, { Text: p } = d, [w, g] = l.useState(!1), y = e.definition, f = Wt[y.id], v = (a == null ? void 0 : a.status) === "queued" || (a == null ? void 0 : a.status) === "running", S = y.id !== "neqsim" && e.effectiveStatus === "unavailable" && y.dependencies.length > 0 && y.dependencies.every((x) => !/(three\.js|java|neqsim)/i.test(x)), b = v ? { label: "查看安装进度", action: n, disabled: !1 } : y.id === "neqsim" && e.effectiveStatus === "needs_install" ? {
    label: "安装 NeqSim 运行环境",
    action: n,
    disabled: !1
  } : e.effectiveStatus === "needs_install" || S ? {
    label: "安装运行环境",
    action: n,
    disabled: !1
  } : e.effectiveStatus === "unconfigured" || e.effectiveStatus === "partial" ? { label: "启用工具", action: r, disabled: !1 } : e.effectiveStatus === "error" || e.effectiveStatus === "unknown" ? { label: "重新检测", action: i, disabled: !1 } : null;
  return l.createElement(
    s,
    {
      size: "small",
      style: { width: "100%", minWidth: 0 },
      styles: {
        body: { minWidth: 0, display: "flex", flexDirection: "column" }
      }
    },
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          minWidth: 0
        }
      },
      l.createElement(
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
        gs[y.domain] || "📦"
      ),
      l.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } },
        l.createElement(
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
          y.name
        ),
        l.createElement(
          "div",
          { style: { marginTop: 3 } },
          l.createElement(
            m,
            { title: `${e.statusDescription} 该状态未包含实际试算验证。` },
            l.createElement(
              o,
              {
                color: tr[e.effectiveStatus] || "default",
                tabIndex: 0
              },
              er[e.effectiveStatus] || e.effectiveStatus
            )
          )
        )
      )
    ),
    l.createElement(
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
      (f == null ? void 0 : f.description) || y.description || "暂无领域说明"
    ),
    l.createElement(
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
      l.createElement(
        p,
        {
          type: "secondary",
          style: { fontSize: 12, lineHeight: "18px", overflowWrap: "anywhere" }
        },
        `输入 · ${(f == null ? void 0 : f.inputs) || "输入信息未提供"}`
      ),
      l.createElement(
        p,
        {
          type: "secondary",
          style: { fontSize: 12, lineHeight: "18px", overflowWrap: "anywhere" }
        },
        `输出 · ${(f == null ? void 0 : f.outputs) || "输出信息未提供"}`
      )
    ),
    a && v ? l.createElement(
      p,
      {
        type: "secondary",
        role: "status",
        style: { marginTop: 8, fontSize: 12, lineHeight: "18px" }
      },
      a.message || "运行环境安装中…"
    ) : null,
    l.createElement(
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
      l.createElement(
        c,
        {
          type: "link",
          size: "small",
          "aria-label": `查看 ${y.name} 的函数`,
          onClick: () => g(!0)
        },
        `查看函数 · ${y.operations.length}`
      ),
      l.createElement(
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
        b ? l.createElement(
          c,
          {
            size: "small",
            type: "primary",
            disabled: b.disabled || !b.action,
            loading: !1,
            "aria-label": b.label,
            onClick: b.action
          },
          b.label
        ) : null,
        l.createElement(
          c,
          {
            size: "small",
            "aria-label": `查看 ${y.name} 详情`,
            onClick: t
          },
          "查看详情"
        )
      )
    ),
    l.createElement(
      u,
      {
        title: `${y.name} · 函数说明`,
        open: w,
        onCancel: () => g(!1),
        width: "min(720px, calc(100vw - 32px))",
        destroyOnHidden: !0,
        footer: l.createElement(
          c,
          {
            onClick: () => g(!1),
            "aria-label": "关闭函数说明"
          },
          "关闭"
        ),
        styles: { body: { maxHeight: "65vh", overflowY: "auto" } }
      },
      l.createElement(wi, { operations: y.operations })
    )
  );
}
const En = [
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
function nr(e, t) {
  return t === "reservoir-visualization" ? En[2] : En.find((n) => n.domains.includes(e)) || En[5];
}
function hs({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: i,
  onNavigateToSkills: a,
  onInstallNeqsim: l,
  neqsimInstallState: s
}) {
  const o = T().React, { Drawer: d, Descriptions: c, Tag: u, Typography: m, Button: p, Divider: w } = T().antd, { Text: g, Paragraph: y } = m;
  if (!e) return null;
  const f = e.definition, v = e.dependencyStatus, S = Wt[f.id], b = nr(f.domain, f.id).title;
  return o.createElement(
    d,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, f.name),
        o.createElement(
          u,
          {
            color: tr[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          er[e.effectiveStatus] || e.effectiveStatus
        )
      ),
      open: t,
      onClose: n,
      width: 560,
      rootClassName: "ugsci-domain-engine-detail-drawer"
    },
    // Overview
    o.createElement(
      c,
      { column: 1, bordered: !0, size: "small" },
      o.createElement(c.Item, { label: "领域" }, b),
      o.createElement(
        c.Item,
        { label: "状态依据" },
        e.statusDescription
      ),
      o.createElement(
        c.Item,
        { label: "检测范围" },
        "检查运行依赖、工具注册和当前专家的启用配置；未执行试算，不代表计算结果已验证。"
      ),
      o.createElement(
        c.Item,
        { label: "来源" },
        f.provider.kind === "driver" ? "内置能力 · MCP Driver" : f.source === "builtin" ? "内置工具" : f.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      o.createElement(
        c.Item,
        { label: "实现" },
        `${f.provider.kind}:${f.provider.id}`
      ),
      o.createElement(
        c.Item,
        { label: "计算类别" },
        f.execution_class === "deterministic" ? "确定性计算" : f.execution_class === "stochastic" ? "随机/概率计算" : f.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      o.createElement(
        c.Item,
        { label: "内核版本" },
        f.engine_version
      ),
      o.createElement(
        c.Item,
        { label: "描述" },
        (S == null ? void 0 : S.description) || f.description || "暂无领域说明"
      ),
      o.createElement(
        c.Item,
        { label: "总输入" },
        (S == null ? void 0 : S.inputs) || "输入信息未提供"
      ),
      o.createElement(
        c.Item,
        { label: "总输出" },
        (S == null ? void 0 : S.outputs) || "输出信息未提供"
      ),
      o.createElement(
        c.Item,
        { label: "已发现工具" },
        e.discoveredToolCount
      ),
      o.createElement(
        c.Item,
        { label: "检测时间" },
        e.checkedAt
      )
    ),
    // Operations
    o.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      o.createElement(g, { strong: !0 }, "领域操作")
    ),
    o.createElement(wi, { operations: f.operations }),
    o.createElement(
      "div",
      { style: { marginTop: 16, display: "flex", gap: 4, flexWrap: "wrap" } },
      ...f.tags.map(
        (x) => o.createElement(u, { key: x, color: "cyan" }, x)
      )
    ),
    // Dependencies
    o.createElement(w, null),
    o.createElement(g, { strong: !0 }, "实现与依赖"),
    v && v.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...v.dependencies.map(
        (x) => o.createElement(
          "div",
          {
            key: x.name,
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
            o.createElement(
              g,
              { style: { fontSize: 13 } },
              x.name
            ),
            o.createElement(
              u,
              {
                color: tr[x.status] || "default",
                style: { fontSize: 11 }
              },
              er[x.status] || x.status
            )
          ),
          x.status !== "available" && x.reason ? o.createElement(
            g,
            {
              type: "secondary",
              style: { display: "block", fontSize: 12, marginTop: 4 }
            },
            x.reason
          ) : null,
          x.status !== "available" && x.install_hint ? o.createElement(
            g,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${x.install_hint}`
          ) : null,
          x.status !== "available" && x.enable_hint ? o.createElement(
            g,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${x.enable_hint}`
          ) : null
        )
      )
    ) : o.createElement(
      y,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(w, null),
    o.createElement(g, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      f.id === "neqsim" && e.effectiveStatus === "needs_install" ? o.createElement(
        p,
        {
          size: "small",
          type: "primary",
          loading: (s == null ? void 0 : s.status) === "queued" || (s == null ? void 0 : s.status) === "running",
          onClick: l
        },
        (s == null ? void 0 : s.status) === "running" ? `${s.message} (${s.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      f.provider.kind === "driver" ? o.createElement(
        p,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : f.source === "library" ? o.createElement(
        p,
        { size: "small", onClick: a },
        "查看相关技能"
      ) : o.createElement(
        p,
        { size: "small", onClick: () => i("builtin") },
        "查看内置工具"
      )
    ),
    f.id === "neqsim" && (s == null ? void 0 : s.status) === "failed" ? o.createElement(
      y,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      s.error || "安装失败"
    ) : null,
    f.id === "neqsim" && (s != null && s.warning) ? o.createElement(
      y,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      s.warning
    ) : null
  );
}
function Es({
  open: e,
  engineName: t,
  plan: n,
  task: r,
  error: i,
  onClose: a,
  onTaskChange: l,
  onRetry: s,
  onCompleted: o,
  onManage: d
}) {
  const c = T().React, { Modal: u, Button: m, Typography: p, Alert: w, Progress: g, Tag: y, Space: f } = T().antd, { Text: v, Paragraph: S } = p, b = c.useRef(0), x = c.useRef(!0), R = `${e}:${(n == null ? void 0 : n.engine_id) || ""}`, J = c.useRef(R);
  J.current = R;
  const [P, j] = c.useState(!1), [X, q] = c.useState(""), [U, $] = c.useState(0), A = (r == null ? void 0 : r.status) === "queued" || (r == null ? void 0 : r.status) === "running";
  c.useEffect(() => {
    j(!1), q("");
  }, [R]), c.useEffect(() => (x.current = !0, () => {
    x.current = !1, b.current += 1;
  }), []), c.useEffect(() => {
    if (!e || !A || !r) return;
    const z = ++b.current;
    let C = !1;
    return (async () => {
      for (; !C && z === b.current; ) {
        if (await new Promise((re) => setTimeout(re, 1e3)), C || z !== b.current) return;
        try {
          const re = await us(r.id);
          if (C || z !== b.current) return;
          if (q(""), l(re), re.status === "completed") {
            o();
            return;
          }
          if (re.status === "failed") return;
        } catch (re) {
          if (C || z !== b.current) return;
          const F = re instanceof Error ? re.message : "连接安装任务失败";
          if (/HTTP 404|not found|未找到/i.test(F))
            try {
              const L = await Zn(r.engine_id);
              if (C || z !== b.current) return;
              L.state === "ready" ? (l({
                ...r,
                status: "completed",
                progress: 100,
                message: "依赖已就绪，已恢复安装状态。",
                error: ""
              }), o()) : L.active_task ? (l(L.active_task), $((le) => le + 1)) : l({
                ...r,
                status: "failed",
                error: "未找到此安装任务，且依赖尚未就绪，请重新发起安装。"
              });
            } catch {
              if (C || z !== b.current) return;
              q("暂时无法确认安装结果，请重新检测以恢复进度。");
            }
          else
            q(
              `连接安装任务时遇到问题。安装可能仍在后台继续，请重新检测以恢复进度。（${F}）`
            );
          return;
        }
      }
    })(), () => {
      C = !0, b.current += 1;
    };
  }, [e, A, r == null ? void 0 : r.id, U, l, o]);
  const M = async () => {
    if (!(n != null && n.installable) || P || A) return;
    const z = J.current;
    j(!0);
    try {
      const C = await ds(n.engine_id);
      if (!x.current || J.current !== z) return;
      l(C), C.status === "completed" && o();
    } catch (C) {
      if (!x.current || J.current !== z) return;
      s(C instanceof Error ? C.message : "无法开始安装，请重试");
    } finally {
      x.current && J.current === z && j(!1);
    }
  }, _ = !!(n != null && n.installable) && !A && (r == null ? void 0 : r.status) !== "completed", O = (r == null ? void 0 : r.status) === "completed", D = (r == null ? void 0 : r.status) === "failed", Y = O ? c.createElement(w, {
    type: "success",
    showIcon: !0,
    message: "安装完成",
    description: (r == null ? void 0 : r.message) || "运行环境安装完成。请关闭弹窗查看刷新后的工具状态。"
  }) : D ? c.createElement(w, {
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
        y,
        { color: A ? "processing" : "default" },
        r.status === "queued" ? "排队中" : r.status === "running" ? "安装中" : r.status
      ),
      c.createElement(v, null, r.message || "正在准备安装…")
    ),
    A ? c.createElement(
      c.Fragment,
      null,
      c.createElement(
        v,
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
    r.warning ? c.createElement(w, {
      style: { marginTop: 10 },
      type: "warning",
      showIcon: !0,
      message: r.warning
    }) : null
  ) : null;
  return c.createElement(
    u,
    {
      title: `${t} · 运行环境`,
      open: e,
      onCancel: a,
      width: "min(520px, calc(100vw - 32px))",
      destroyOnHidden: !1,
      footer: O ? c.createElement(
        m,
        {
          type: "primary",
          onClick: a,
          "aria-label": "关闭安装完成提示"
        },
        "关闭"
      ) : D ? c.createElement(
        f,
        null,
        c.createElement(m, { onClick: a }, "关闭"),
        c.createElement(
          m,
          {
            type: "primary",
            onClick: M,
            disabled: !(n != null && n.installable),
            loading: P,
            "aria-label": "重试安装"
          },
          "重试安装"
        )
      ) : r ? c.createElement(
        m,
        { onClick: a, "aria-label": "关闭安装进度" },
        "后台继续，关闭窗口"
      ) : n && !n.installable && n.state !== "ready" ? c.createElement(
        c.Fragment,
        null,
        c.createElement(m, { onClick: a }, "关闭"),
        c.createElement(
          m,
          { onClick: d, "aria-label": "前往工具或技能管理入口" },
          "前往管理入口"
        )
      ) : (n == null ? void 0 : n.state) === "ready" ? c.createElement(
        m,
        { type: "primary", onClick: a },
        "关闭"
      ) : c.createElement(
        f,
        null,
        c.createElement(m, { onClick: a }, "取消"),
        c.createElement(
          m,
          {
            type: "primary",
            disabled: !_ || P,
            loading: P,
            onClick: M,
            "aria-label": "开始安装运行环境"
          },
          "开始安装"
        )
      )
    },
    i ? c.createElement(w, {
      type: "error",
      showIcon: !0,
      message: "运行环境操作未完成",
      description: i,
      action: c.createElement(
        m,
        {
          size: "small",
          onClick: () => s(),
          "aria-label": "重新检测运行环境"
        },
        "重新检测"
      )
    }) : null,
    X ? c.createElement(w, {
      style: { marginTop: 12 },
      type: "warning",
      showIcon: !0,
      message: X,
      action: c.createElement(
        m,
        {
          size: "small",
          onClick: () => {
            q(""), $((z) => z + 1), s();
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
        S,
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
          v,
          {
            strong: !0,
            style: { display: "block", marginBottom: 6 }
          },
          "依赖清单"
        ),
        ...n.packages.map(
          (z) => c.createElement(
            "div",
            {
              key: z,
              style: {
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: "21px",
                overflowWrap: "anywhere"
              }
            },
            z
          )
        )
      ) : c.createElement(w, {
        type: n.installable ? "info" : "warning",
        showIcon: !0,
        message: n.message || "没有可列出的安装依赖。"
      }),
      O || n.state === "ready" ? c.createElement(w, {
        style: { marginTop: 12 },
        type: "success",
        showIcon: !0,
        message: "运行环境已就绪"
      }) : null,
      !n.installable && n.state !== "ready" ? c.createElement(w, {
        style: { marginTop: 12 },
        type: "warning",
        showIcon: !0,
        message: n.message || "当前环境不支持自动安装，请前往工具或技能管理入口处理。"
      }) : null
    ) : null,
    Y
  );
}
function bs(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function vs({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var ve, ke;
  const r = T().React, { useState: i, useEffect: a, useCallback: l, useMemo: s, useRef: o } = r, {
    Spin: d,
    Empty: c,
    Button: u,
    message: m,
    Row: p,
    Col: w,
    Input: g
  } = T().antd, { ReloadOutlined: y, SearchOutlined: f } = T().antdIcons || {}, v = (ke = (ve = T()).useSelectedAgent) == null ? void 0 : ke.call(ve), S = (v == null ? void 0 : v.id) || "default", [b, x] = i([]), [R, J] = i(!0), [P, j] = i(""), [X, q] = i(!1), [U, $] = i(null), [A, M] = i({ general: !0 }), [_, O] = i(null), [D, Y] = i(null), [z, C] = i(
    null
  ), [te, re] = i(
    null
  ), [F, L] = i(""), [le, ie] = i(!1), W = o(S);
  W.current = S;
  const pe = o(U);
  pe.current = U;
  const ae = o(0), G = o(0);
  a(
    () => () => {
      ae.current += 1, G.current += 1;
    },
    []
  );
  const ue = l(async (h = !1, V = !1) => {
    var Ee, $e;
    V || J(!0);
    const I = V && typeof window < "u" ? {
      x: window.scrollX,
      y: window.scrollY,
      drawerBody: typeof document < "u" ? document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      ) : null,
      drawerTop: typeof document < "u" && ((Ee = document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      )) == null ? void 0 : Ee.scrollTop) || 0
    } : null, se = () => {
      if (!I || typeof window > "u") return;
      const Le = () => {
        var Ge;
        window.scrollTo(I.x, I.y), (Ge = I.drawerBody) != null && Ge.isConnected && (I.drawerBody.scrollTop = I.drawerTop);
      };
      typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(Le) : Le();
    }, ge = W.current;
    try {
      const [Le, Ge, rt] = await Promise.all([
        ls(h),
        ps(ge, h),
        ms(ge, h)
      ]);
      if (ge !== W.current) return;
      const Ue = [];
      for (const Ye of Le)
        try {
          let B = null;
          if (Ye.engine.provider.kind === "driver") {
            const de = Ye.engine.provider.id;
            B = Ge.get(de) || null;
          }
          Ue.push(fs(Ye, B, rt));
        } catch {
        }
      x(Ue);
      const ot = ($e = pe.current) == null ? void 0 : $e.definition.id;
      if (ot) {
        const Ye = Ue.find((B) => B.definition.id === ot);
        Ye && (pe.current = Ye, $(Ye));
      }
      se();
    } catch (Le) {
      const Ge = Le instanceof Error ? Le.message : "加载领域引擎失败";
      m.error(Ge), V || x([]);
    } finally {
      V || J(!1);
    }
  }, []);
  a(() => {
    ue();
  }, [S, ue]);
  const N = s(() => {
    if (!P.trim()) return b;
    const h = P.trim().toLowerCase();
    return b.filter(
      (V) => {
        var I, se, ge;
        return nr(V.definition.domain, V.definition.id).title.toLowerCase().includes(h) || V.definition.name.toLowerCase().includes(h) || V.definition.domain.toLowerCase().includes(h) || V.definition.description.toLowerCase().includes(h) || [
          ((I = Wt[V.definition.id]) == null ? void 0 : I.description) || "",
          ((se = Wt[V.definition.id]) == null ? void 0 : se.inputs) || "",
          ((ge = Wt[V.definition.id]) == null ? void 0 : ge.outputs) || ""
        ].some((Ee) => Ee.toLowerCase().includes(h)) || V.definition.tags.some((Ee) => Ee.toLowerCase().includes(h)) || V.definition.operations.some((Ee) => {
          const $e = vi(Ee);
          return [
            Ee.name,
            Ee.id,
            Ee.description,
            ...Ee.tool_names,
            $e.description,
            $e.inputs,
            $e.outputs,
            $e.limitations || ""
          ].some((Le) => Le.toLowerCase().includes(h));
        });
      }
    );
  }, [b, P]), k = s(
    () => En.map((h) => ({
      ...h,
      views: N.filter(
        (V) => nr(V.definition.domain, V.definition.id).key === h.key
      )
    })).filter((h) => h.views.length > 0),
    [N]
  ), oe = l(() => {
    ue(!0);
  }, [ue]), he = l((h) => {
    pe.current = h, $(h), q(!0);
  }, []), xe = l(() => {
    q(!1), e == null || e();
  }, [e]), ze = l(
    (h) => {
      q(!1), t == null || t(h);
    },
    [t]
  ), Se = l(() => {
    q(!1), n == null || n();
  }, [n]), me = l(async () => {
    if ((_ == null ? void 0 : _.status) === "queued" || (_ == null ? void 0 : _.status) === "running")
      return;
    const h = ++ae.current, V = () => h === ae.current;
    try {
      let I = await ss();
      if (!V()) return;
      for (O(I); I.status === "queued" || I.status === "running"; ) {
        if (await new Promise((se) => setTimeout(se, 1e3)), !V()) return;
        try {
          I = await cs(I.id);
        } catch (se) {
          if (!bs(se)) throw se;
          const ge = await os(!0);
          if (!V()) return;
          ge.ready ? I = {
            ...I,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: ge,
            recovered: !0
          } : I = {
            ...I,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: ge,
            recovered: !0
          };
        }
        if (!V()) return;
        O(I);
      }
      if (!V()) return;
      I.status === "completed" ? (I.warning ? m.warning(I.warning) : m.success("NeqSim 运行环境已安装并启用"), await ue(!0, !0)) : m.error(I.error || "NeqSim 安装失败");
    } catch (I) {
      if (!V()) return;
      m.error(I instanceof Error ? I.message : "NeqSim 安装失败");
    }
  }, [ue, _]), Ie = l(
    async (h) => {
      if (h.definition.id === "neqsim") {
        (_ == null ? void 0 : _.status) === "queued" || (_ == null ? void 0 : _.status) === "running" ? (pe.current = h, $(h), q(!0)) : me();
        return;
      }
      Y(h), C(null), re(null), L(""), ie(!0);
      const V = ++G.current;
      try {
        const I = await Zn(h.definition.id);
        if (V !== G.current) return;
        C(I), re(I.active_task);
      } catch (I) {
        if (V !== G.current) return;
        L(
          I instanceof Error ? I.message : "读取运行环境失败"
        );
      }
    },
    [me, _]
  ), Pe = l(
    async (h) => {
      if (h) {
        L(h);
        return;
      }
      if (!D) return;
      L("");
      const V = ++G.current;
      try {
        const I = await Zn(
          D.definition.id
        );
        if (V !== G.current) return;
        C(I), re(I.active_task);
      } catch (I) {
        if (V !== G.current) return;
        L(
          I instanceof Error ? I.message : "读取运行环境失败"
        );
      }
    },
    [D]
  ), Q = l(() => {
    ue(!0, !0);
  }, [ue]), ye = l(
    (h) => {
      h.definition.provider.kind === "driver" || h.definition.source === "mcp" ? xe() : h.definition.source === "library" || h.definition.provider.kind === "skill" ? Se() : ze("builtin");
    },
    [xe, Se, ze]
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
        value: P,
        onChange: (h) => {
          const V = h.target.value;
          j(V), M(V.trim() ? {} : { general: !0 });
        },
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        u,
        {
          icon: y ? r.createElement(y) : void 0,
          onClick: oe,
          loading: R
        },
        "刷新"
      )
    ),
    // Content
    R ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(d, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : N.length === 0 ? r.createElement(c, {
      description: P ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...k.map((h) => {
        const V = !!A[h.key];
        return r.createElement(
          "div",
          { key: h.key, style: { marginBottom: 20 } },
          r.createElement(
            u,
            {
              type: "text",
              onClick: () => M((I) => ({
                ...I,
                [h.key]: !I[h.key]
              })),
              "aria-expanded": !V,
              style: {
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 8,
                paddingInline: 0
              }
            },
            `${V ? "▸" : "▾"} ${h.title} (${h.views.length})`
          ),
          V ? null : r.createElement(
            p,
            { gutter: [12, 12], align: "top" },
            ...h.views.map(
              (I) => r.createElement(
                w,
                {
                  key: I.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 12,
                  lg: 12,
                  style: { display: "flex", minWidth: 0 }
                },
                r.createElement(ys, {
                  view: I,
                  onDetails: () => he(I),
                  onInstall: () => void Ie(I),
                  onConfigure: () => ye(I),
                  onRefresh: () => void ue(!0),
                  installTask: I.definition.id === "neqsim" ? _ ? {
                    id: _.id,
                    engine_id: "neqsim",
                    status: _.status,
                    progress: _.progress,
                    message: _.message,
                    error: _.error,
                    warning: _.warning
                  } : null : (D == null ? void 0 : D.definition.id) === I.definition.id ? te : null
                })
              )
            )
          )
        );
      })
    ),
    // Detail drawer
    r.createElement(hs, {
      view: U,
      open: X,
      onClose: () => q(!1),
      onNavigateToMcp: xe,
      onNavigateToTools: ze,
      onNavigateToSkills: Se,
      onInstallNeqsim: me,
      neqsimInstallState: _
    }),
    r.createElement(Es, {
      open: le,
      engineName: (D == null ? void 0 : D.definition.name) || "领域引擎",
      plan: z,
      task: te,
      error: F,
      onClose: () => {
        G.current += 1, ie(!1);
      },
      onTaskChange: re,
      onRetry: Pe,
      onCompleted: Q,
      onManage: () => {
        G.current += 1, ie(!1), D && ye(D);
      }
    })
  );
}
const ws = Qo, Si = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function Ss(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Si.has(t) ? t : e;
  } catch {
    return e;
  }
}
function pa(e) {
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
function rr({ page: e }) {
  const t = T().React, { useEffect: n, useState: r } = t, { Alert: i, Spin: a } = T().antd, [l, s] = r(null), [o, d] = r("");
  if (n(() => {
    let u = !0;
    const m = T().loadBuiltinPage;
    return s(null), m ? (d(""), m(e).then((p) => {
      u && s(() => p);
    }).catch((p) => {
      u && d(
        p instanceof Error ? p.message : "加载原生管理页面失败"
      );
    }), () => {
      u = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      u = !1;
    });
  }, [e]), o)
    return t.createElement(i, {
      type: "error",
      showIcon: !0,
      message: "原生管理功能加载失败",
      description: o
    });
  if (!l)
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
  return t.createElement(l, { embedded: !0, embeddedLabels: c });
}
function xs({
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
        children: n.createElement(rr, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: n.createElement(rr, { page: "tools" })
      }
    ]
  });
}
function _s({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  const r = T().React, { Tabs: i } = T().antd;
  return r.createElement(i, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: r.createElement(is)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          vs,
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
        children: r.createElement(rr, { page: "acp" })
      }
    ]
  });
}
function xi({
  initialTab: e = "engines"
} = {}) {
  var f, v;
  const t = T().React, { useEffect: n, useState: r } = t, { Tabs: i, Tag: a } = T().antd, { RocketOutlined: l, ToolOutlined: s, ThunderboltOutlined: o } = T().antdIcons || {}, d = (v = (f = T()).useSelectedAgent) == null ? void 0 : v.call(f), c = (d == null ? void 0 : d.id) || "default", [u, m] = r(
    () => Ss(e)
  ), [p, w] = r("mcp");
  n(() => {
    try {
      const S = new URLSearchParams(window.location.search).get("tab");
      S && !Si.has(S) && pa(u);
    } catch {
    }
  }, [u]);
  const g = (S) => {
    m(S), pa(S);
  }, y = (S, b) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    b ? t.createElement(b, { style: { fontSize: 14 } }) : null,
    S
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(zn, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        a,
        { color: "blue" },
        `当前专家：${c}`
      )
    }),
    t.createElement(i, {
      activeKey: u,
      onChange: (S) => g(S),
      items: [
        {
          key: "engines",
          label: y("引擎", l),
          children: t.createElement(
            _s,
            {
              onNavigateToMcp: () => {
                w("mcp"), g("tools");
              },
              onNavigateToTools: (S) => {
                w(S || "mcp"), g("tools");
              },
              onNavigateToSkills: () => g("skills")
            }
          )
        },
        {
          key: "tools",
          label: y("工具", s),
          children: t.createElement(xs, {
            activeSubTab: p,
            onSubTabChange: w
          })
        },
        {
          key: "skills",
          label: y("技能", o),
          children: t.createElement(ws, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const _i = xi;
function ks() {
  return T().React.createElement(_i, {
    initialTab: "tools"
  });
}
function Cs() {
  return T().React.createElement(_i, {
    initialTab: "skills"
  });
}
function Ts(e, t = !1) {
  const n = String(e || "").trim().toLowerCase().replace(/[-_]/g, "");
  if (n === "sse") return "sse";
  if (n === "stdio") return "stdio";
  if (n === "streamablehttp" || n === "http" || !n && t) return "streamable_http";
  if (!n) return "stdio";
  throw new Error("不支持的 MCP 连接方式，请检查目录配置");
}
function Is(e) {
  return [...new Set([...JSON.stringify(e).matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((t) => t[1]))];
}
function $s(e, t) {
  const n = (a, l = !1) => a.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (s, o) => {
    const d = t[o];
    if (!(d != null && d.trim())) throw new Error(`请填写配置项：${o}`);
    return l ? encodeURIComponent(d) : d;
  });
  let r = e.url;
  if (r) {
    const a = r.indexOf("?");
    r = a < 0 ? n(r) : n(r.slice(0, a)) + "?" + n(r.slice(a + 1), !0);
    const l = new URL(r);
    if (!["https:", "http:"].includes(l.protocol) || l.username || l.password) throw new Error("请输入有效的 HTTP MCP 地址");
    if (l.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(l.hostname)) throw new Error("远程 MCP 请使用 HTTPS 地址");
    if (l.hash) throw new Error("MCP 地址不能包含片段标识");
  }
  const i = Object.fromEntries(Object.entries(e.headers || {}).map(([a, l]) => {
    const s = n(l);
    if (/[\r\n]/.test(a + s)) throw new Error("请求头不能包含换行");
    return [a, s];
  }));
  return {
    ...e,
    url: r,
    command: n(e.command || ""),
    args: (e.args || []).map((a) => n(a)),
    cwd: n(e.cwd || ""),
    headers: i,
    env: Object.fromEntries(Object.entries(e.env || {}).map(([a, l]) => [a, n(l)]))
  };
}
const fa = {
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
function zs(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, n]) => typeof n == "string" && (n.startsWith("your-") || n.includes("${")));
}
const bn = "ugsci.market.githubSources", ga = "https://github.com/anthropics/skills/tree/main/skills", ki = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", As = `${ki}/skills`;
function Ps(e) {
  const t = e.replace(/^\/+/, "");
  return In(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function wn(e, t = !1) {
  const n = e.replace(/^\/+/, "");
  return ct(`/plugins/oss-proxy?path=${encodeURIComponent(n)}${t ? "&refresh=true" : ""}`, { cache: "no-store" });
}
async function wr(e, t = !1) {
  const n = e.replace(/^\/+/, ""), r = await wn(n, t);
  if (!r.ok)
    throw new Error(`OSS fetch failed (${r.status}): ${n}`);
  return await r.json();
}
function $t(e) {
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
function Rs(e) {
  var a, l, s;
  const t = {}, n = e.config || {};
  for (const o of /* @__PURE__ */ new Set([...e.env || [], ...Is(n)]))
    t[o] = `your-${o.toLowerCase().replace(/_/g, "-")}`;
  for (const [o, d] of Object.entries(n.env || {}))
    t[o] || (t[o] = d);
  let r = "🔌";
  const i = (e.icon || "").toLowerCase();
  return i.includes("folder") ? r = "📁" : i.includes("git") ? r = "🌿" : i.includes("github") ? r = "🐙" : i.includes("database") || i.includes("postgres") || i.includes("sqlite") ? r = "🗄️" : i.includes("search") || i.includes("brave") ? r = "🔍" : i.includes("browser") || i.includes("puppeteer") ? r = "🎭" : i.includes("memory") || i.includes("brain") ? r = "🧠" : i.includes("file") || i.includes("fetch") ? r = "🌐" : i.includes("slack") ? r = "💬" : i.includes("google") ? r = "📁" : i.includes("notion") ? r = "📝" : i.includes("jupyter") ? r = "📊" : i.includes("science") || i.includes("flask") ? r = "🔬" : i.includes("book") || i.includes("arxiv") ? r = "📚" : i.includes("patent") && (r = "📜"), {
    id: e.id,
    name: e.name,
    emoji: r,
    iconUrl: e.icon_url ? Ps(e.icon_url) : void 0,
    category: e.category ? $t(e.category) : "",
    description: e.description,
    transport: Ts(e.transport || n.transport || n.type, !!n.url),
    url: n.url,
    headers: n.headers,
    cwd: n.cwd,
    source: e.source,
    authType: (a = e.auth) == null ? void 0 : a.type,
    availability: e.availability,
    requirements: e.requirements,
    limitations: e.limitations,
    inputHints: e.input_hints,
    command: ((l = e.config) == null ? void 0 : l.command) || "",
    args: ((s = e.config) == null ? void 0 : s.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const Ci = "ugsci.market.mcpSources", Ti = "ugsci.market.expertSources";
function Ii(e, t) {
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
function $i(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Os() {
  return Ii(Ci, "mcp");
}
function dn(e) {
  $i(Ci, e);
}
function Ms() {
  return Ii(Ti, "expert");
}
function un(e) {
  $i(Ti, e);
}
function zi(e) {
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
    const a = decodeURIComponent(i[0]), l = decodeURIComponent(i[1]);
    let s = "main", o = "";
    return i.length >= 4 && (i[2] === "tree" || i[2] === "blob") ? (s = decodeURIComponent(i[3]), i.length > 4 && (o = i.slice(4).map(decodeURIComponent).join("/"))) : i.length > 2 && (o = i.slice(2).map(decodeURIComponent).join("/")), o = o.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: a,
      repo: l,
      ref: s || "main",
      skillsPath: o,
      label: `${a}/${l}`,
      platform: r
    };
  } catch {
    return null;
  }
}
function Ai(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function Ls(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase(), r = n.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!r) return null;
    const i = r[1], a = `${t.protocol}//${n}`, l = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return l ? {
      endpoint: a,
      prefix: l,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Bs() {
  try {
    const e = localStorage.getItem(bn);
    if (!e) {
      const r = [], i = zi(ga);
      return i && r.push({
        id: Ai(
          i.owner,
          i.repo,
          i.skillsPath,
          i.platform
        ),
        url: ga,
        label: i.label,
        owner: i.owner,
        repo: i.repo,
        ref: i.ref,
        skillsPath: i.skillsPath,
        enabled: !1,
        platform: i.platform
      }), localStorage.setItem(bn, JSON.stringify(r)), r;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const n = t.filter(
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === As)
    ).map((r) => ({
      ...r,
      platform: r.platform || "github",
      owner: r.owner || "",
      repo: r.repo || "",
      ref: r.ref || "",
      skillsPath: r.skillsPath || ""
    }));
    return n.length !== t.length && localStorage.setItem(
      bn,
      JSON.stringify(n)
    ), n;
  } catch {
    return [];
  }
}
function mn(e) {
  try {
    localStorage.setItem(
      bn,
      JSON.stringify(e)
    );
  } catch {
  }
}
function js(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const n = t[1], r = {}, i = n.split(`
`);
  let a = "";
  for (const l of i) {
    const s = l.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (s) {
      a = s[1];
      let o = s[2].trim();
      (o.startsWith('"') && o.endsWith('"') || o.startsWith("'") && o.endsWith("'")) && (o = o.slice(1, -1)), a === "name" ? r.name = o : a === "description" ? r.description = o : a === "version" ? r.version = o : a === "author" && (r.author = o);
    }
  }
  return r;
}
async function Us(e) {
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
  const l = await a.json();
  if (!Array.isArray(l)) return [];
  const s = l.filter(
    (d) => d.type === "dir" && d.name
  );
  return await Promise.all(
    s.map(async (d) => {
      const c = e.skillsPath ? e.skillsPath + "/" : "", u = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${c}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${c}${d.name}/SKILL.md`, m = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}`, p = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: d.name,
        description: "",
        source_url: m,
        html_url: m,
        version: null,
        author: null
      };
      try {
        const w = {};
        t && e.accessToken && (w.Authorization = `token ${e.accessToken}`);
        const g = await fetch(u, {
          headers: w
        });
        if (!g.ok) return p;
        const y = await g.text(), f = js(y);
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
async function Ns(e) {
  const t = Ls(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, i = r.split("/").map(encodeURIComponent).join("/"), a = await wn(
    `${i}/manifest.json`
  );
  if (!a.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${a.status})`
    );
  const l = await a.json(), s = [];
  if (l && l.tag_groups && typeof l.tag_groups == "object")
    for (const [c, u] of Object.entries(l.tag_groups))
      Array.isArray(u) && s.push({
        id: c,
        label: $t(c),
        tags: u
      });
  const o = [];
  function d(c, u) {
    for (const m of c) {
      if (m.type === "collection" && Array.isArray(m.children)) {
        d(m.children, m.name);
        continue;
      }
      const p = m.path || m.name || "";
      if (!p) continue;
      const w = p.split("/").map(encodeURIComponent).join("/"), g = `${n}/${i}/${w}`;
      let y = null;
      if (m.metadata) {
        const v = m.metadata.match(/version:\s*"?([\d.]+)"?/);
        v && (y = v[1]);
      }
      const f = u ? `${e.label}/${u}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: f,
        name: m.name || p.split("/").pop() || p,
        description: m.description || "",
        source_url: g,
        html_url: g,
        version: y,
        author: null,
        tag: m.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(l) ? d(
    l.map(
      (c) => typeof c == "string" ? { name: c, path: c } : c
    )
  ) : l && Array.isArray(l.skills) && d(l.skills), o.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: o, categories: s };
}
async function Ds(e = !1) {
  const t = await wr("mcp/manifest.json", e), n = [], r = {};
  if (t.tag_groups && typeof t.tag_groups == "object")
    for (const [a, l] of Object.entries(t.tag_groups))
      Array.isArray(l) && (r[a] = l, n.push({
        id: a,
        label: $t(a),
        tags: l
      }));
  return { servers: (t.servers || []).map((a) => {
    var o, d, c;
    let l = "";
    const s = a.tags || [];
    for (const [u, m] of Object.entries(r))
      if (m.some((p) => s.includes(p))) {
        l = u;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      tags: s,
      transport: a.transport || ((o = a.config) == null ? void 0 : o.transport) || ((d = a.config) == null ? void 0 : d.type) || ((c = a.config) != null && c.url ? "streamable_http" : "stdio"),
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
      category: l
    };
  }), categories: n };
}
async function Fs() {
  const e = await wr("skills/manifest.json"), t = [], n = /* @__PURE__ */ new Set();
  function r(i, a) {
    for (const l of i) {
      if ((l == null ? void 0 : l.type) === "collection" && Array.isArray(l.children)) {
        r(l.children, l.name || a);
        continue;
      }
      const s = String((l == null ? void 0 : l.path) || (l == null ? void 0 : l.name) || "").trim();
      if (!s) continue;
      const o = s.split("/").map(encodeURIComponent).join("/"), d = `${ki}/skills/${o}`, c = typeof l.tag == "string" && l.tag.trim() ? l.tag.trim() : void 0;
      c && n.add(c);
      let u = null;
      if (typeof l.metadata == "string") {
        const m = l.metadata.match(/version:\s*"?([\d.]+)"?/);
        m && (u = m[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: a ? `UGSci/${a}` : "UGSci",
        name: l.name || s.split("/").pop() || s,
        description: l.description || "",
        source_url: d,
        html_url: d,
        version: u,
        author: null,
        tag: c,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(e) ? r(
    e.map(
      (i) => typeof i == "string" ? { name: i, path: i } : i
    )
  ) : e && Array.isArray(e.skills) && r(e.skills), t.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: t,
    categories: Array.from(n).map((i) => ({
      id: i,
      label: i
    }))
  };
}
async function Gs() {
  const e = await wr("agents/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [i, a] of Object.entries(e.tag_groups))
      Array.isArray(a) && (n[i] = a, t.push({
        id: i,
        label: $t(i),
        tags: a
      }));
  return { agents: (e.agents || []).map((i) => {
    let a = "";
    const l = i.tags || [];
    for (const [s, o] of Object.entries(n))
      if (o.some((d) => l.includes(d))) {
        a = s;
        break;
      }
    return {
      id: i.id || i.name,
      name: i.name || i.id,
      description: i.description || "",
      path: i.path || "",
      tags: l,
      config: i.config,
      instructions: i.instructions,
      skills_manifest: i.skills_manifest,
      drivers: i.drivers,
      category: a
    };
  }), categories: t };
}
async function Ws(e) {
  const t = e.filter((l) => l.enabled), n = await Promise.all(
    t.map(async (l) => {
      try {
        if (l.platform === "oss") {
          const { skills: s, categories: o } = await Ns(l);
          return { skills: s, categories: o, error: null, label: l.label };
        } else
          return { skills: await Us(l), categories: [], error: null, label: l.label };
      } catch (s) {
        return {
          skills: [],
          categories: [],
          error: s.message || String(s),
          label: l.label
        };
      }
    })
  ), r = [], i = [], a = [];
  for (const l of n)
    r.push(...l.skills), i.push(...l.categories), l.error && a.push({ label: l.label, message: l.error });
  return { skills: r, errors: a, categories: i };
}
function Hs({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const i = T().React, { useState: a } = i, {
    Modal: l,
    Input: s,
    Button: o,
    List: d,
    Tag: c,
    Switch: u,
    Typography: m,
    Tooltip: p,
    message: w
  } = T().antd, {
    PlusOutlined: g,
    DeleteOutlined: y,
    LinkOutlined: f,
    GithubOutlined: v
  } = T().antdIcons || {}, { Text: S } = m, [b, x] = a(""), [R, J] = a(""), P = () => {
    const U = b.trim();
    if (!U) return;
    const $ = zi(U);
    if (!$) {
      w.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const A = Ai($.owner, $.repo, $.skillsPath, $.platform);
    if (n.some((O) => O.id === A)) {
      w.warning("该源已存在");
      return;
    }
    const M = {
      id: A,
      url: U,
      label: $.label,
      owner: $.owner,
      repo: $.repo,
      ref: $.ref,
      skillsPath: $.skillsPath,
      enabled: !0,
      platform: $.platform,
      accessToken: R.trim() || void 0
    }, _ = [...n, M];
    mn(_), r(_), x(""), J(""), w.success(`已添加源: ${$.label}`);
  }, j = (U, $) => {
    const A = n.map(
      (M) => M.id === U ? { ...M, enabled: $ } : M
    );
    mn(A), r(A);
  }, X = (U, $) => {
    const A = n.map(
      (M) => M.id === U ? { ...M, accessToken: $.trim() || void 0 } : M
    );
    mn(A), r(A);
  }, q = (U) => {
    const $ = n.filter((A) => A.id !== U);
    mn($), r($), w.success("已移除源");
  };
  return i.createElement(
    l,
    {
      open: e,
      onCancel: t,
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        v ? i.createElement(v, { style: { fontSize: 18 } }) : null,
        i.createElement("span", null, "配置技能源")
      ),
      footer: i.createElement(
        o,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    i.createElement(
      "div",
      { style: { marginBottom: 16 } },
      i.createElement(
        S,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        i.createElement(s, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: b,
          onChange: (U) => x(U.target.value),
          onPressEnter: P,
          prefix: f ? i.createElement(f) : void 0,
          style: { flex: 1 }
        }),
        i.createElement(
          o,
          {
            type: "primary",
            icon: g ? i.createElement(g) : void 0,
            onClick: P
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      b.trim() && b.trim().toLowerCase().includes("gitee.com") ? i.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        i.createElement(
          S,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        i.createElement(s.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: R,
          onChange: (U) => J(U.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    i.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      i.createElement(S, { strong: !0 }, `已配置源 (${n.length})`)
    ),
    i.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (U) => i.createElement(
        d.Item,
        {
          actions: [
            i.createElement(
              p,
              { title: U.enabled ? "点击禁用" : "点击启用" },
              i.createElement(u, {
                size: "small",
                checked: U.enabled,
                onChange: ($) => j(U.id, $)
              })
            ),
            i.createElement(
              p,
              { title: "移除此源" },
              i.createElement(
                o,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: y ? i.createElement(y) : void 0,
                  onClick: () => q(U.id)
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
              { color: U.platform === "gitee" ? "orange" : U.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              U.platform === "gitee" ? "Gitee" : U.platform === "oss" ? "OSS" : "GitHub"
            ),
            i.createElement(
              c,
              { style: { fontSize: 11 } },
              U.label
            ),
            U.skillsPath ? i.createElement(
              S,
              { type: "secondary", style: { fontSize: 11 } },
              `/${U.skillsPath}`
            ) : null,
            U.platform !== "oss" ? i.createElement(
              S,
              { type: "secondary", style: { fontSize: 11 } },
              `@${U.ref}`
            ) : null
          ),
          i.createElement(
            S,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            U.url
          ),
          // Gitee token input for existing Gitee sources
          U.platform === "gitee" ? i.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            i.createElement(
              S,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            i.createElement(s.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: U.accessToken || "",
              onChange: ($) => X(U.id, $.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function ya({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: i
}) {
  const a = T().React, { useState: l } = a, {
    Modal: s,
    Input: o,
    Button: d,
    List: c,
    Tag: u,
    Switch: m,
    Typography: p,
    Tooltip: w,
    message: g
  } = T().antd, {
    PlusOutlined: y,
    DeleteOutlined: f,
    LinkOutlined: v,
    ApiOutlined: S,
    UserOutlined: b,
    ImportOutlined: x,
    ExportOutlined: R,
    CopyOutlined: J
  } = T().antdIcons || {}, { Text: P } = p, [j, X] = l(""), [q, U] = l(""), [$, A] = l(""), [M, _] = l(!1), O = i === "mcp" ? "MCP" : "专家模板", D = i === "mcp" ? S ? a.createElement(S, { style: { fontSize: 18 } }) : null : b ? a.createElement(b, { style: { fontSize: 18 } }) : null, Y = () => {
    const F = j.trim(), L = q.trim();
    if (!F) return;
    const le = L || F.slice(0, 40), ie = `${i}:${F}`;
    if (n.some((ae) => ae.id === ie)) {
      g.warning("该源已存在");
      return;
    }
    const W = {
      id: ie,
      label: le,
      url: F,
      enabled: !0,
      type: i
    }, pe = [...n, W];
    i === "mcp" ? dn(pe) : un(pe), r(pe), X(""), U(""), g.success(`已添加${O}源: ${le}`);
  }, z = (F, L) => {
    const le = n.map(
      (ie) => ie.id === F ? { ...ie, enabled: L } : ie
    );
    i === "mcp" ? dn(le) : un(le), r(le);
  }, C = (F) => {
    const L = n.filter((le) => le.id !== F);
    i === "mcp" ? dn(L) : un(L), r(L), g.success("已移除源");
  }, te = () => {
    const F = JSON.stringify(
      { type: i, sources: n },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(F), g.success(`${O}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const L = document.createElement("textarea");
      L.value = F, document.body.appendChild(L), L.select(), document.execCommand("copy"), document.body.removeChild(L), g.success(`${O}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, re = () => {
    const F = $.trim();
    if (!F) {
      g.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const L = JSON.parse(F);
      let le = [];
      if (Array.isArray(L))
        le = L;
      else if (L && Array.isArray(L.sources))
        le = L.sources;
      else if (L && typeof L == "object")
        le = [L];
      else
        throw new Error("Invalid format");
      const ie = le.filter(
        (G) => G && typeof G.url == "string" && typeof G.label == "string"
      );
      if (ie.length === 0) {
        g.error("未找到有效的源数据");
        return;
      }
      const W = new Set(n.map((G) => G.id)), pe = [];
      for (const G of ie) {
        const ue = G.id || `${i}:${G.url}`;
        W.has(ue) || pe.push({
          id: ue,
          label: G.label,
          url: G.url,
          enabled: G.enabled !== !1,
          type: i
        });
      }
      if (pe.length === 0) {
        g.info("所有源均已存在，无新增");
        return;
      }
      const ae = [...n, ...pe];
      i === "mcp" ? dn(ae) : un(ae), r(ae), A(""), _(!1), g.success(`成功导入 ${pe.length} 个${O}源`);
    } catch (L) {
      g.error(`JSON 解析失败: ${L.message || "格式错误"}`);
    }
  };
  return a.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        D,
        a.createElement("span", null, `配置${O}源`)
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
              icon: R ? a.createElement(R) : void 0,
              onClick: te,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          a.createElement(
            d,
            {
              icon: x ? a.createElement(x) : void 0,
              onClick: () => _(!M),
              size: "small"
            },
            M ? "隐藏导入" : "导入JSON"
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
      P,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${O}源地址，支持从远程仓库或团队共享的 JSON 导入${O}配置。`
    ),
    // Import section (collapsible)
    M ? a.createElement(
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
        P,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${O}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      a.createElement(o.TextArea, {
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
        value: $,
        onChange: (F) => A(F.target.value),
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
            onClick: re
          },
          "导入"
        ),
        a.createElement(
          d,
          {
            size: "small",
            onClick: () => A("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    a.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      a.createElement(o, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: q,
        onChange: (F) => U(F.target.value),
        style: { width: 200 }
      }),
      a.createElement(o, {
        placeholder: i === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: j,
        onChange: (F) => X(F.target.value),
        onPressEnter: Y,
        prefix: v ? a.createElement(v) : void 0,
        style: { flex: 1 }
      }),
      a.createElement(
        d,
        {
          type: "primary",
          icon: y ? a.createElement(y) : void 0,
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
        P,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (F) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              w,
              { title: F.enabled ? "点击禁用" : "点击启用" },
              a.createElement(m, {
                size: "small",
                checked: F.enabled,
                onChange: (L) => z(F.id, L)
              })
            ),
            a.createElement(
              w,
              { title: "移除此源" },
              a.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: f ? a.createElement(f) : void 0,
                  onClick: () => C(F.id)
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
              u,
              {
                color: i === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              F.label
            ),
            F.enabled ? null : a.createElement(
              u,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          a.createElement(
            P,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            F.url
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
async function qs() {
  return ce("/market/providers");
}
async function Vs(e) {
  return ce(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Js(e, t, n, r, i) {
  return ce("/market/search", {
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
function ha(e) {
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
async function Ea(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), ce("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function Ks({ embedded: e = !1 } = {}) {
  var ea;
  const t = T().React, { useState: n, useEffect: r, useCallback: i, useMemo: a, useRef: l } = t, {
    Spin: s,
    Empty: o,
    Input: d,
    Button: c,
    message: u,
    Row: m,
    Col: p,
    Card: w,
    Tag: g,
    Tooltip: y,
    Typography: f,
    Select: v,
    Drawer: S,
    Descriptions: b,
    Tabs: x,
    Badge: R,
    Progress: J,
    Modal: P,
    Alert: j
  } = T().antd, {
    ReloadOutlined: X,
    SearchOutlined: q,
    DownloadOutlined: U,
    AppstoreOutlined: $,
    ShopOutlined: A,
    CheckCircleOutlined: M,
    LoadingOutlined: _,
    UserOutlined: O,
    UserAddOutlined: D,
    SettingOutlined: Y,
    GithubOutlined: z,
    ApiOutlined: C
  } = T().antdIcons || {}, { Text: te, Paragraph: re, Title: F } = f, [L, le] = n("skills"), [ie, W] = n([]), [pe, ae] = n([]), [G, ue] = n([]), [N, k] = n(""), [oe, he] = n(""), [xe, ze] = n(!1), [Se, me] = n(!1), [Ie, Pe] = n(
    {}
  ), [Q, ye] = n(null), [ve, ke] = n({}), [h, V] = n([]), [I, se] = n(""), [ge, Ee] = n(""), [$e, Le] = n(""), [Ge, rt] = n({}), [Ue, ot] = n(""), [Ye, B] = n(/* @__PURE__ */ new Set()), [de, ne] = n(null), [Oe, Ce] = n({}), [Fe, Qe] = n([]), [at, Ae] = n([]), [He, qe] = n([]), [st, We] = n(""), [Ne, Me] = n(!1), [ut, Pt] = n(!1), [nn, Ar] = n([]), [pl, Pr] = n(!1), [fl, Rr] = n([]), [gl, Or] = n(!1), [Mr, Lr] = n([]), [Br, jr] = n([]), [Bn, Ur] = n(!1), [bt, Nr] = n(""), [Dr, Fr] = n([]), [Gr, Wr] = n([]), [Hr, qr] = n(!1), [vt, Vr] = n(""), [jn, Jr] = n(!1), [Ze, rn] = n(null), [Rt, yl] = n([]), Ot = l(null);
  r(() => {
    Promise.all([
      qs().catch(() => []),
      Vs("zh").catch(() => []),
      An().catch(() => [])
    ]).then(([E, H, K]) => {
      W(E), ae(H), V(K), K.length > 0 && (se(K[0].id), ot(K[0].id));
    });
  }, []);
  const an = i(async (E) => {
    const H = E ?? Bs();
    if (Qe(E || H), H.filter((fe) => fe.enabled).length === 0) {
      Ae([]);
      return;
    }
    Me(!0);
    try {
      const { skills: fe, errors: _e, categories: Be } = await Ws(H);
      if (Ae(fe), yl(Be), _e.length > 0) {
        for (const Re of _e)
          console.warn(`[ugsci] GitHub source '${Re.label}' error: ${Re.message}`);
        u.warning(
          `部分源加载失败: ${_e.map((Re) => Re.label).join(", ")}`
        );
      }
    } catch (fe) {
      u.error(fe.message || "加载技能源失败"), Ae([]);
    } finally {
      Me(!1);
    }
  }, []), ln = i(async (E = !1) => {
    var _e, Be, Re;
    Ur(!0), qr(!0), Me(!0);
    const [H, K, fe] = await Promise.allSettled([
      Ds(E),
      Gs(),
      Fs()
    ]);
    if (H.status === "fulfilled" ? (Lr(H.value.servers), jr(H.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((_e = H.reason) == null ? void 0 : _e.message) || H.reason}`), Lr([]), jr([])), Ur(!1), K.status === "fulfilled" ? (Fr(K.value.agents), Wr(K.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((Be = K.reason) == null ? void 0 : Be.message) || K.reason}`), Fr([]), Wr([])), qr(!1), fe.status === "fulfilled")
      qe(fe.value.skills), We("");
    else {
      const it = ((Re = fe.reason) == null ? void 0 : Re.message) || String(fe.reason);
      console.warn(`[ugsci] Skills manifest error: ${it}`), qe([]), We(it);
    }
    Me(!1);
  }, []);
  r(() => {
    an(), ln(), Ar(Os()), Rr(Ms());
  }, [an, ln]);
  const on = i(
    async (E, H, K) => {
      ze(!0);
      try {
        const fe = await Js(
          E,
          K,
          20,
          "zh",
          H || void 0
        );
        K === void 0 || Object.keys(K).length === 0 ? ue(fe.results) : ue((Re) => [...Re, ...fe.results]);
        const _e = Object.values(fe.by_provider || {}).some(
          (Re) => Re.has_more
        );
        me(_e);
        const Be = {};
        for (const [Re, it] of Object.entries(fe.by_provider || {}))
          Be[Re] = (K[Re] || 1) + 1;
        if (Pe(Be), fe.errors.length > 0)
          for (const Re of fe.errors)
            console.warn(
              `[ugsci] Market provider '${Re.provider}' error: ${Re.message}`
            );
      } catch (fe) {
        u.error(fe.message || "搜索市场失败"), ue([]);
      } finally {
        ze(!1);
      }
    },
    []
  );
  r(() => (Ot.current && clearTimeout(Ot.current), Ot.current = setTimeout(() => {
    on(N, oe, {});
  }, 400), () => {
    Ot.current && clearTimeout(Ot.current);
  }), [N, oe, on]);
  const hl = () => {
    on(N, oe, Ie);
  }, Kr = async (E) => {
    const H = `${E.source}:${E.slug}`;
    try {
      ke((fe) => ({ ...fe, [H]: "installing" }));
      const K = await Ea(E.source_url);
      K.installed && u.success(
        `技能「${K.name || E.name}」已安装到技能池，可在技能中心查看`
      ), ke((fe) => {
        const _e = { ...fe };
        return delete _e[H], _e;
      });
    } catch (K) {
      u.error(ha(K) || "安装技能失败"), ke((fe) => {
        const _e = { ...fe };
        return delete _e[H], _e;
      });
    }
  }, El = (E) => {
    window.history.pushState({}, "", E), window.dispatchEvent(new PopStateEvent("popstate"));
  }, bl = async (E) => {
    const H = `github:${E.sourceId}:${E.name}`, K = Fe.find((_e) => _e.id === E.sourceId), fe = (K == null ? void 0 : K.accessToken) || void 0;
    try {
      ke((Be) => ({ ...Be, [H]: "installing" }));
      const _e = await Ea(E.source_url, fe);
      _e.installed && u.success(
        `技能「${_e.name || E.name}」已安装到技能池，可在技能中心查看`
      ), ke((Be) => {
        const Re = { ...Be };
        return delete Re[H], Re;
      });
    } catch (_e) {
      u.error(ha(_e) || "安装技能失败"), ke((Be) => {
        const Re = { ...Be };
        return delete Re[H], Re;
      });
    }
  }, yt = a(() => {
    const E = [], H = /* @__PURE__ */ new Set();
    for (const K of [...He, ...at]) {
      const fe = K.source_url || `${K.sourceLabel}:${K.name}`;
      H.has(fe) || (H.add(fe), E.push(K));
    }
    return E;
  }, [He, at]), Xr = a(() => {
    const E = [], H = /* @__PURE__ */ new Set();
    if (Rt.length > 0)
      for (const K of Rt)
        H.has(K.id) || (H.add(K.id), E.push(K));
    for (const K of yt)
      K.tag && !H.has(K.tag) && (H.add(K.tag), E.push({ id: K.tag, label: K.tag }));
    for (const K of yt)
      !K.isOfficial && K.sourceLabel && !H.has(K.sourceLabel) && (H.add(K.sourceLabel), E.push({ id: K.sourceLabel, label: K.sourceLabel }));
    return E;
  }, [yt, Rt]), Un = a(() => {
    let E = yt;
    if (oe) {
      const H = Rt.find((K) => K.id === oe);
      H && H.tags ? E = E.filter(
        (K) => K.tag && H.tags.includes(K.tag) || K.sourceLabel === oe
      ) : E = E.filter(
        (K) => K.tag === oe || K.sourceLabel === oe
      );
    }
    if (N.trim()) {
      const H = N.toLowerCase();
      E = E.filter(
        (K) => {
          var fe;
          return K.name.toLowerCase().includes(H) || ((fe = K.description) == null ? void 0 : fe.toLowerCase().includes(H));
        }
      );
    }
    return E;
  }, [yt, N, oe, Rt]), Yr = ie.filter((E) => E.available), wt = a(() => oe ? G.filter((E) => {
    const H = Yr.find((K) => K.key === E.source);
    return (H == null ? void 0 : H.label) === oe;
  }) : G, [G, oe, Yr]), vl = t.createElement(
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
        prefix: q ? t.createElement(q) : void 0,
        value: N,
        onChange: (E) => k(E.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      t.createElement(
        te,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      t.createElement(
        c,
        {
          icon: z ? t.createElement(z) : void 0,
          onClick: () => Pt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    st && yt.length === 0 ? t.createElement(j, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
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
        te,
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
          color: oe === "" ? "blue" : void 0,
          onClick: () => he("")
        },
        "全部"
      ),
      ...Xr.map((E) => {
        const H = at.some(
          (K) => !K.isOfficial && K.sourceLabel === E.id
        );
        return t.createElement(
          g,
          {
            key: E.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: oe === E.id ? H ? "blue" : "geekblue" : void 0,
            icon: H && z ? t.createElement(z) : void 0,
            onClick: () => he(
              oe === E.id ? "" : E.id
            )
          },
          E.label
        );
      })
    ) : null,
    // GitHub skills section
    Ne && yt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : Un.length > 0 ? t.createElement(
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
        z ? t.createElement(z, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(
          te,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Un.length})`
        )
      ),
      t.createElement(
        m,
        { gutter: [12, 12] },
        ...Un.map((E) => {
          const H = `github:${E.sourceId}:${E.name}`, K = ve[H];
          return t.createElement(
            p,
            { key: H, xs: 24, sm: 12, md: 8, lg: 6 },
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
                z ? t.createElement(z, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : t.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                t.createElement(
                  y,
                  { title: E.name },
                  t.createElement(
                    te,
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
                  )
                )
              ),
              t.createElement(
                re,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                E.description || "暂无描述"
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
                  E.sourcePath || E.sourceLabel ? t.createElement(
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
                    C ? t.createElement(C, { style: { fontSize: 10 } }) : null,
                    E.sourcePath || E.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  E.tag ? t.createElement(
                    g,
                    { color: "geekblue", style: { fontSize: 10 } },
                    E.tag
                  ) : null,
                  E.version ? t.createElement(
                    g,
                    { style: { fontSize: 10 } },
                    `v${E.version}`
                  ) : null
                ),
                K ? t.createElement(
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
                    icon: U ? t.createElement(U) : void 0,
                    onClick: () => bl(E)
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
    wt.length > 0 || xe ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      A ? t.createElement(A, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      t.createElement(
        te,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${wt.length > 0 ? ` (${wt.length})` : ""}`
      )
    ) : null,
    // Results grid
    xe && wt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(s, { size: "large" })
    ) : wt.length === 0 ? t.createElement(o, {
      description: N ? `未找到匹配「${N}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...wt.map((E) => {
        const H = `${E.source}:${E.slug}`, K = ve[H];
        return t.createElement(
          p,
          { key: H, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ye(E)
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
              E.icon_url ? t.createElement("img", {
                src: E.icon_url,
                alt: E.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              t.createElement(
                y,
                { title: E.name },
                t.createElement(
                  te,
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
                )
              )
            ),
            t.createElement(
              re,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              E.description || "暂无描述"
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
                  E.source
                ),
                E.version ? t.createElement(
                  g,
                  { style: { fontSize: 10 } },
                  `v${E.version}`
                ) : null
              ),
              K ? t.createElement(
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
                  icon: U ? t.createElement(U) : void 0,
                  onClick: (fe) => {
                    fe.stopPropagation(), Kr(E);
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
    Se && !xe ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: hl, loading: xe },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    Q ? t.createElement(
      S,
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
        onClose: () => ye(null),
        width: 480,
        extra: t.createElement(
          c,
          {
            type: "primary",
            icon: U ? t.createElement(U) : void 0,
            onClick: () => {
              Kr(Q);
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
          Q.source
        ),
        t.createElement(
          b.Item,
          { label: "描述" },
          Q.description || "-"
        ),
        Q.version ? t.createElement(
          b.Item,
          { label: "版本" },
          Q.version
        ) : null,
        Q.author ? t.createElement(
          b.Item,
          { label: "作者" },
          Q.author
        ) : null,
        t.createElement(
          b.Item,
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
          te,
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
            ([E, H]) => t.createElement(
              "div",
              { key: E, style: { textAlign: "center" } },
              t.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(H)
              ),
              t.createElement(
                te,
                { type: "secondary", style: { fontSize: 11 } },
                E
              )
            )
          )
        )
      ) : null
    ) : null
  ), Nn = a(() => {
    let E = Dr;
    if (vt && (E = E.filter((H) => H.category === vt)), ge.trim()) {
      const H = ge.toLowerCase();
      E = E.filter(
        (K) => K.name.toLowerCase().includes(H) || K.description.toLowerCase().includes(H) || K.tags.some((fe) => fe.toLowerCase().includes(H))
      );
    }
    return E;
  }, [Dr, ge, vt]), wl = async (E) => {
    if (!jn) {
      Jr(!0);
      try {
        let H = E.description;
        if (E.instructions)
          try {
            const _e = E.instructions.replace(/^\/+/, ""), Be = await wn(_e);
            Be.ok && (H = await Be.text());
          } catch {
          }
        let K = [];
        if (E.skills_manifest)
          try {
            const _e = E.skills_manifest.replace(/^\/+/, ""), Be = await wn(_e);
            if (Be.ok) {
              const Re = await Be.json();
              Array.isArray(Re) ? K = Re.map((it) => typeof it == "string" ? it : it.name).filter(Boolean) : Re.skills && (K = Re.skills.map((it) => typeof it == "string" ? it : it.name).filter(Boolean));
            }
          } catch {
          }
        const fe = await ce("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: E.name,
            description: E.description,
            skill_names: K
          })
        });
        await kt(fe.id, "AGENTS.md", H), u.success(`专家「${E.name}」创建成功，已跳转至专家`), El("/ugsci-experts");
      } catch (H) {
        u.error(H.message || "创建专家失败");
      } finally {
        Jr(!1);
      }
    }
  }, Qr = i(async (E) => {
    if (E)
      try {
        const H = await hr(E);
        B(new Set(H.map((K) => K.key)));
      } catch {
        B(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Ue && Qr(Ue);
  }, [Ue, Qr]);
  const Sl = async (E) => {
    if (!Ue) {
      u.warning("请先选择目标专家");
      return;
    }
    if (zs(E)) {
      const H = Object.entries(E.env).filter(([, fe]) => fe.startsWith("your-") || fe.includes("${")), K = {};
      for (const [fe] of H)
        K[fe] = "";
      Ce(K), ne(E);
      return;
    }
    await Zr(E, E.env || {});
  }, Zr = async (E, H) => {
    rt((K) => ({ ...K, [E.id]: !0 }));
    try {
      const K = $s({
        url: E.url,
        command: E.command,
        args: E.args,
        headers: E.headers,
        cwd: E.cwd,
        env: { ...E.env, ...H }
      }, H), fe = E.id;
      await Er(Ue, {
        client_key: fe,
        client: {
          name: E.name,
          description: E.description,
          enabled: E.authType !== "oauth2",
          transport: E.transport,
          url: K.url || "",
          command: K.command || "",
          args: K.args || [],
          env: K.env || {},
          cwd: K.cwd || "",
          headers: K.headers || {}
        }
      }), u.success(E.authType === "oauth2" ? `「${E.name}」已添加，请在工具·技能的 MCP 管理中完成账号授权并启用` : `MCP「${E.name}」已添加到当前专家，连接状态请在 MCP 管理中检测`), B((_e) => new Set(_e).add(fe));
    } catch (K) {
      u.error(K.message || `添加 MCP「${E.name}」失败`);
    } finally {
      rt((K) => ({ ...K, [E.id]: !1 }));
    }
  }, xl = async () => {
    if (!de) return;
    const E = [];
    for (const [K, fe] of Object.entries(Oe))
      if (!fe || !fe.trim()) {
        const _e = fa[K];
        E.push((_e == null ? void 0 : _e.label) || K);
      }
    if (E.length > 0) {
      u.warning(`请填写以下配置项: ${E.join(", ")}`);
      return;
    }
    const H = de;
    ne(null), Ce({}), await Zr(H, { ...Oe });
  }, Dn = a(() => {
    let E = Mr;
    if (bt && (E = E.filter((H) => H.category === bt)), $e.trim()) {
      const H = $e.toLowerCase();
      E = E.filter(
        (K) => K.name.toLowerCase().includes(H) || K.description.toLowerCase().includes(H) || K.tags.some((fe) => fe.toLowerCase().includes(H))
      );
    }
    return E.map(Rs);
  }, [Mr, $e, bt]), _l = t.createElement(
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
        prefix: q ? t.createElement(q) : void 0,
        value: $e,
        onChange: (E) => Le(E.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        t.createElement(
          te,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        t.createElement(v, {
          value: Ue,
          onChange: (E) => ot(E),
          style: { minWidth: 180 },
          size: "small",
          options: h.map((E) => ({ value: E.id, label: E.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        c,
        {
          icon: C ? t.createElement(C) : void 0,
          onClick: () => Pr(!0),
          size: "small"
        },
        "配置 MCP 源"
      ),
      t.createElement(c, { size: "small", loading: Bn, onClick: () => ln(!0) }, "刷新目录")
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Br.length > 0 ? t.createElement(
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
        te,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        g,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: bt === "" ? "blue" : void 0,
          onClick: () => Nr("")
        },
        "全部"
      ),
      ...Br.map(
        (E) => t.createElement(
          g,
          {
            key: E.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: bt === E.id ? "geekblue" : void 0,
            onClick: () => Nr(
              bt === E.id ? "" : E.id
            )
          },
          E.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    Bn && Dn.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Dn.length === 0 ? t.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...Dn.map(
        (E) => {
          var H, K;
          return t.createElement(
            p,
            { key: E.id, xs: 24, sm: 12, md: 8 },
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
                  E.iconUrl ? t.createElement("img", {
                    src: E.iconUrl,
                    alt: E.name,
                    style: { width: 28, height: 28, objectFit: "contain" },
                    onError: (fe) => {
                      fe.target.style.display = "none";
                    }
                  }) : E.emoji
                ),
                t.createElement(
                  "div",
                  { style: { flex: 1 } },
                  t.createElement(
                    te,
                    { strong: !0, style: { fontSize: 14 } },
                    E.name
                  ),
                  t.createElement(
                    "div",
                    { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                    t.createElement(
                      g,
                      { color: "blue", style: { fontSize: 10 } },
                      E.category
                    ),
                    t.createElement(
                      g,
                      {
                        color: E.transport === "stdio" ? "purple" : "cyan",
                        style: { fontSize: 10 }
                      },
                      E.transport
                    ),
                    E.env && Object.keys(E.env).length > 0 ? t.createElement(
                      g,
                      { color: "orange", style: { fontSize: 10 } },
                      "需配置密钥"
                    ) : null
                  )
                )
              ),
              // Description
              t.createElement(
                re,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 3 }
                },
                E.description
              ),
              (H = E.requirements) != null && H.length || (K = E.limitations) != null && K.length ? t.createElement(
                "details",
                { style: { marginTop: 8, fontSize: 12 } },
                t.createElement("summary", { style: { cursor: "pointer", color: "var(--ant-color-primary, #1677ff)" } }, "接入要求与限制"),
                ...[...E.requirements || [], ...E.limitations || []].map((fe, _e) => t.createElement("p", { key: _e, style: { margin: "6px 0" } }, fe)),
                E.source ? t.createElement("a", { href: E.source, target: "_blank", rel: "noopener noreferrer" }, "查看来源说明 ↗") : null
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
                  te,
                  { type: "secondary", style: { fontSize: 11 } },
                  E.transport === "stdio" ? `${E.command} ${(E.args || []).join(" ")}` : E.authType === "oauth2" ? "添加后需登录授权" : "远程服务 · 按账号权限连接"
                ),
                Ye.has(E.id) ? t.createElement(
                  c,
                  { size: "small", disabled: !0 },
                  "已添加"
                ) : t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    loading: !!Ge[E.id],
                    icon: C ? t.createElement(C) : void 0,
                    onClick: () => Sl(E)
                  },
                  E.transport === "stdio" ? "添加工具" : "连接"
                )
              )
            )
          );
        }
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
      A ? t.createElement(A, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        te,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), kl = de ? t.createElement(
    P,
    {
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, de.iconUrl ? t.createElement("img", { src: de.iconUrl, alt: de.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (E) => {
          E.target.style.display = "none";
        } }) : de.emoji),
        t.createElement("span", null, `连接 ${de.name}`)
      ),
      open: !!de,
      onCancel: () => {
        ne(null), Ce({});
      },
      onOk: xl,
      okText: "添加连接",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    t.createElement(
      te,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      de.description
    ),
    (ea = de.requirements) != null && ea.length ? t.createElement("div", { style: { marginBottom: 16, fontSize: 12 } }, ...de.requirements.map((E, H) => t.createElement("p", { key: H }, E))) : null,
    ...Object.entries(de.env || {}).filter(([, E]) => E.startsWith("your-") || E.includes("${")).map(([E]) => {
      var fe;
      const H = ((fe = de.inputHints) == null ? void 0 : fe[E]) || fa[E], K = (H == null ? void 0 : H.isSecret) !== !1;
      return t.createElement(
        "div",
        { key: E, style: { marginBottom: 16 } },
        t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          t.createElement(
            te,
            { strong: !0, style: { fontSize: 13 } },
            (H == null ? void 0 : H.label) || E
          ),
          t.createElement(
            g,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        H ? t.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          H.help,
          H.link ? t.createElement(
            "a",
            {
              href: H.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        K ? t.createElement(d.Password, {
          placeholder: `请输入 ${(H == null ? void 0 : H.label) || E}`,
          value: Oe[E] || "",
          onChange: (_e) => Ce((Be) => ({
            ...Be,
            [E]: _e.target.value
          })),
          style: { width: "100%" }
        }) : t.createElement(d, {
          placeholder: `请输入 ${(H == null ? void 0 : H.label) || E}`,
          value: Oe[E] || "",
          onChange: (_e) => Ce((Be) => ({
            ...Be,
            [E]: _e.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        t.createElement(
          te,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${E}`
        )
      );
    })
  ) : null, Cl = t.createElement(
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
        prefix: q ? t.createElement(q) : void 0,
        value: ge,
        onChange: (E) => Ee(E.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        c,
        {
          icon: O ? t.createElement(O) : void 0,
          onClick: () => Or(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
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
        te,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        g,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: vt === "" ? "blue" : void 0,
          onClick: () => Vr("")
        },
        "全部"
      ),
      ...Gr.map(
        (E) => t.createElement(
          g,
          {
            key: E.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: vt === E.id ? "geekblue" : void 0,
            onClick: () => Vr(
              vt === E.id ? "" : E.id
            )
          },
          E.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Hr && Nn.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : Nn.length === 0 ? t.createElement(o, {
      description: "未找到匹配的人才",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...Nn.map(
        (E) => t.createElement(
          p,
          { key: E.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => rn(E)
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
                name: E.name,
                size: 40
              }),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  te,
                  { strong: !0, style: { fontSize: 14 } },
                  E.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  E.category ? t.createElement(
                    g,
                    { color: "blue", style: { fontSize: 10 } },
                    $t(E.category)
                  ) : null,
                  E.tags.includes("mcp") ? t.createElement(
                    g,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            t.createElement(
              re,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              E.description
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
                te,
                { type: "secondary", style: { fontSize: 11 } },
                E.tags.filter((H) => H !== "agent" && H !== "template" && H !== "workspace").slice(0, 3).join(" · ") || "人才模板"
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
      A ? t.createElement(A, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        te,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Tl = [
    {
      key: "skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        $ ? t.createElement($, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: vl
    },
    {
      key: "mcp",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        C ? t.createElement(C, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: _l
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? t.createElement(D, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Cl
    }
  ];
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    e ? null : t.createElement(zn, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          c,
          {
            type: "primary",
            icon: X ? t.createElement(X) : void 0,
            onClick: () => {
              on(N, oe, {}), an(), ln();
            },
            loading: xe || Ne || Bn || Hr
          },
          "刷新"
        )
      )
    }),
    t.createElement(x, {
      items: Tl,
      activeKey: L,
      onChange: (E) => le(E)
    }),
    // Skill source config modal
    t.createElement(Hs, {
      open: ut,
      onClose: () => Pt(!1),
      sources: Fe,
      onChange: (E) => {
        Qe(E), an(E);
      }
    }),
    // MCP source config modal
    t.createElement(ya, {
      open: pl,
      onClose: () => Pr(!1),
      sources: nn,
      onChange: (E) => Ar(E),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    kl,
    // Expert source config modal
    t.createElement(ya, {
      open: gl,
      onClose: () => Or(!1),
      sources: fl,
      onChange: (E) => Rr(E),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Ze ? t.createElement(
      P,
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
              te,
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
                $t(Ze.category)
              ) : null,
              ...Ze.tags.filter(
                (E) => E !== "agent" && E !== "template" && E !== "workspace"
              ).slice(0, 5).map(
                (E) => t.createElement(
                  g,
                  { key: E, style: { fontSize: 10 } },
                  E
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => rn(null),
        width: 640,
        footer: t.createElement(
          "div",
          { style: { textAlign: "right" } },
          t.createElement(
            c,
            {
              onClick: () => rn(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          t.createElement(
            c,
            {
              type: "primary",
              loading: jn,
              disabled: jn,
              icon: D ? t.createElement(D) : void 0,
              style: Ke,
              onClick: async () => {
                await wl(Ze), rn(null);
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
          te,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        t.createElement(
          re,
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
          te,
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
          te,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Ze.drivers && Object.keys(Ze.drivers).length > 0 ? t.createElement(
        "div",
        null,
        t.createElement(
          te,
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
            ([E, H]) => t.createElement(
              g,
              { key: E, color: "cyan", style: { fontSize: 11 } },
              `${E}${H && H.length > 0 ? ` (${H.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Xs() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const ba = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, va = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Ys() {
  const e = T(), t = e.React, { useEffect: n, useRef: r } = t, i = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, a = (i == null ? void 0 : i.id) || "default", l = r(null), s = r(null);
  return n(() => {
    if (l.current === a) return;
    l.current = a, pr();
    const o = Xs(), d = ba[o] || ba.en, c = va[o] || va.en;
    let u = !1;
    return (async () => {
      var m, p;
      try {
        const w = await Pn(a);
        if (u) return;
        const g = ei(w);
        if (s.current) {
          try {
            s.current();
          } catch {
          }
          s.current = null;
        }
        const y = window.QwenPaw;
        (m = y == null ? void 0 : y.chat) != null && m.welcome && (g.length > 0 ? (s.current = y.chat.welcome.set("ugsci", {
          description: d,
          prompts: g
        }), console.info(
          `[ugsci] Injected ${g.length} welcome prompts for agent "${a}"`
        )) : (s.current = y.chat.welcome.set("ugsci", {
          description: d,
          prompts: [c]
        }), console.info(
          `[ugsci] No skills for agent "${a}" — using default prompt`
        )));
      } catch (w) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${a}":`,
          w
        );
        const g = window.QwenPaw;
        if ((p = g == null ? void 0 : g.chat) != null && p.welcome && !u) {
          if (s.current) {
            try {
              s.current();
            } catch {
            }
            s.current = null;
          }
          s.current = g.chat.welcome.set("ugsci", {
            description: d,
            prompts: [c]
          });
        }
      }
    })(), () => {
      u = !0;
    };
  }, [a]), null;
}
const Qs = 256;
let Je = {};
const ar = /* @__PURE__ */ new Set(), Sn = () => ar.forEach((e) => e()), Zs = (e) => (ar.add(e), () => ar.delete(e)), Xt = /* @__PURE__ */ new Map();
function wa(e, t) {
  const n = [];
  for (const a of t) {
    if (!a) continue;
    const l = Je[zt(e, a)] || Object.values(Je).find((s) => s.uiId === a);
    l && n.push(l);
  }
  const r = `${e}::${t.join("\0")}`, i = Xt.get(r);
  return i && i.length === n.length && i.every((a, l) => a === n[l]) ? i : (Xt.set(r, n), n);
}
function zt(e, t) {
  return `${e}::${t}`;
}
function xn(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? xn(e.genui) : e.ui && typeof e.ui == "object" ? xn(e.ui.genui) : null;
}
function Ht(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, i = typeof r == "string" ? Ht(r) : xn(n);
        if (i) return i;
      }
      return null;
    }
    return xn(t);
  } catch {
    return null;
  }
}
function qt(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const n = JSON.parse(e);
    if (Array.isArray(n)) {
      const r = (t = n.find((i) => (i == null ? void 0 : i.type) === "text")) == null ? void 0 : t.text;
      return typeof r == "string" ? qt(r) : null;
    }
    return n && n.ok === !1 ? n : null;
  } catch {
    return null;
  }
}
const Sa = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), Gn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function Pi(e) {
  var r, i, a, l;
  if (!Array.isArray(e)) return [];
  const t = [], n = (s, o = !1) => {
    var u, m, p;
    if (!s || typeof s != "object") return;
    if (Array.isArray(s)) {
      const w = o ? s.map((g) => {
        var y;
        return ((y = g == null ? void 0 : g.data) == null ? void 0 : y.name) ?? (g == null ? void 0 : g.name);
      }).filter((g) => !!g).map((g) => String(g)) : [];
      if (o && w.length) {
        const g = w.some((y) => Gn.has(y));
        for (const y of s) {
          const f = ((u = y == null ? void 0 : y.data) == null ? void 0 : u.output) ?? (y == null ? void 0 : y.output) ?? ((m = y == null ? void 0 : y.data) == null ? void 0 : m.result) ?? (y == null ? void 0 : y.result) ?? ((p = y == null ? void 0 : y.data) == null ? void 0 : p.content) ?? (y == null ? void 0 : y.content);
          if (f == null) continue;
          const v = typeof f == "string" ? f : JSON.stringify(f), S = Ht(v) || (g ? qt(v) : null);
          S && t.push(S);
        }
      }
      s.forEach((g) => n(g));
      return;
    }
    const d = s;
    if (d.type === "tool_result") {
      const g = (Array.isArray(d.output) ? d.output : []).filter((v) => (v == null ? void 0 : v.type) === "text").map((v) => v.text), y = g.length ? g.join(`
`) : d.output, f = g.length ? g : [typeof y == "string" ? y : JSON.stringify(y)];
      for (const v of f) {
        const S = Ht(v) || (Gn.has(String(d.name || "")) ? qt(v) : null);
        S && t.push(S);
      }
      return;
    }
    const c = Sa.has(String(d.type || ""));
    Object.entries(d).forEach(
      ([w, g]) => n(g, c && w === "content")
    );
  };
  n(e);
  for (const s of e) {
    if (!s || typeof s != "object") continue;
    const o = s;
    if (!Sa.has(String(o.type || "")) || !Array.isArray(o.content)) continue;
    const d = o.content, c = (i = (r = d[0]) == null ? void 0 : r.data) == null ? void 0 : i.name;
    if (!c) continue;
    const u = (l = (a = d[1]) == null ? void 0 : a.data) == null ? void 0 : l.output;
    if (u == null) continue;
    const m = typeof u == "string" ? u : JSON.stringify(u), p = Ht(m) || (Gn.has(String(c)) ? qt(m) : null);
    p && t.push(p);
  }
  return Array.from(new Map(t.map((s) => [`${s.kind}:${s.ui_id}:${s.revision}`, s])).values());
}
function Ri(e) {
  var l;
  const t = zt(e.sessionId, e.uiId), n = Object.entries(Je).filter(([, s]) => s.uiId === e.uiId).sort(([, s], [, o]) => o.revision - s.revision), r = Je[t] || ((l = n[0]) == null ? void 0 : l[1]);
  if (r && e.revision < r.revision) return;
  const i = { ...Je };
  for (const [s] of n) s !== t && delete i[s];
  i[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const a = Object.entries(i).sort(([, s], [, o]) => o.updatedAt - s.updatedAt);
  Je = Object.fromEntries(a.slice(0, Qs)), Sn();
}
function ec(e, t) {
  for (const n of Pi(t))
    !n.ui_id || !n.tree || Ri({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const Oi = {
  setSnapshot: Ri,
  applyPatch(e, t, n, r) {
    var d, c;
    const i = (d = window.QwenPaw) == null ? void 0 : d.host, a = r || ((c = i == null ? void 0 : i.getCurrentSessionId) == null ? void 0 : c.call(i)) || "", l = zt(a, e.ui_id), s = Je[l] || Object.values(Je).find((u) => u.uiId === e.ui_id);
    if (!s || n <= s.revision) return;
    Je = { ...Object.fromEntries(Object.entries(Je).filter(([, u]) => u.uiId !== e.ui_id)), [l]: { ...s, sessionId: a, tree: t, revision: n, updatedAt: Date.now() } }, Sn();
  },
  getSnapshot: (e, t) => Je[zt(e, t)],
  clearSession(e) {
    Je = Object.fromEntries(Object.entries(Je).filter(([, t]) => t.sessionId !== e));
    for (const t of [...Xt.keys()])
      t.startsWith(`${e}::`) && Xt.delete(t);
    Sn();
  },
  hydrateFromMessages: ec
};
function tc({ children: e }) {
  return e;
}
function nc() {
  return Oi;
}
function rc(e, t) {
  var a, l;
  const n = (l = (a = window.QwenPaw) == null ? void 0 : a.host) == null ? void 0 : l.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), i = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    Zs,
    () => wa(e, i),
    () => wa(e, i)
  );
}
function ac(e) {
  Oi.clearSession(e);
}
function ic() {
  Je = {}, Xt.clear(), Sn();
}
function Vt(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return Vt(JSON.parse(e));
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
    if (n.output !== void 0) return Vt(n.output);
    if (n.content !== void 0) return Vt(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function lc(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const i = r[0], a = i == null ? void 0 : i.data, l = (a == null ? void 0 : a.name) || "";
  if (r.length > 1) {
    const s = r[1], o = s == null ? void 0 : s.data, d = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (o == null ? void 0 : o.result) ?? (s == null ? void 0 : s.result);
    if (d != null) return { resultText: Vt(d), status: n, toolName: l };
  }
  if (a != null && a.output) {
    const s = a.output;
    return { resultText: Vt(s), status: n, toolName: l };
  }
  return { resultText: "", status: n, toolName: l };
}
function xa(e) {
  var p, w, g, y;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: i, toolName: a } = lc(e), l = i === "in_progress" || i === "calling", s = i === "failed" || i === "error", o = Ht(r), d = o ? null : qt(r);
  let c = 0;
  (w = o == null ? void 0 : o.tree) != null && w.root && (c = Mi(o.tree.root));
  const u = a === "emit_ui_patch" || (o == null ? void 0 : o.kind) === "genui_patch", m = l ? u ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : s ? u ? "📝 UI Patch Error" : "🎨 UI Tree Error" : o ? u ? `📝 UI Patched (rev ${o.revision ?? "?"})` : `🎨 UI Tree (${c} nodes)` : u ? "📝 UI Patch" : "🎨 UI Tree";
  return n.createElement(
    "details",
    { open: l || s, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      n.createElement("span", null, u ? "📝" : "🎨"),
      n.createElement("span", null, m),
      o != null && o.ok ? n.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((g = o.ui_id) == null ? void 0 : g.slice(0, 16)) ?? ""}…`) : null
    ),
    s || d && !o ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      n.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (d == null ? void 0 : d.message) || "Unknown error"),
      d != null && d.hint ? n.createElement("div", { style: { color: "#999" } }, `💡 ${d.hint}`) : null
    ) : o != null && o.ok ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (y = o.tree) != null && y.root ? `GenUI 已在回复正文中展示（${c} 个节点，revision ${o.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : n.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, r || "(waiting for result...)")
  );
}
function Mi(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const n of e.children) t += Mi(n);
  return t;
}
function vn(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return vn(JSON.parse(e));
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
    if (n.output !== void 0) return vn(n.output);
    if (n.content !== void 0) return vn(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function oc(e) {
  var l;
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const i = (l = r[0]) == null ? void 0 : l.data, a = (i == null ? void 0 : i.name) || "";
  if (r.length > 1) {
    const s = r[1], o = s == null ? void 0 : s.data, d = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content);
    if (d != null) return { resultText: vn(d), status: n, toolName: a };
  }
  return { resultText: "", status: n, toolName: a };
}
function _a(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: i, toolName: a } = oc(e), l = a === "get_genui_guide", s = i === "in_progress" || i === "calling";
  let o = l ? "GenUI 指南" : "组件目录", d = r;
  try {
    const u = r ? JSON.parse(r) : null;
    if (u && typeof u == "object") {
      const m = u.components;
      Array.isArray(m) ? (o = `组件目录（${m.length} 个 kind）`, d = m.map((p) => p == null ? void 0 : p.kind).filter(Boolean).join(" · ")) : (u.purpose || u.layout_structure) && (o = "GenUI 指南", d = String(u.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"));
    }
  } catch {
  }
  return n.createElement(
    "details",
    { style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement("summary", { style: { cursor: "pointer" } }, s ? l ? "查阅 GenUI 指南…" : "查阅组件目录…" : o),
    n.createElement("div", { style: { padding: "8px 4px", fontSize: 12, color: "#666", lineHeight: 1.5 } }, d || "(waiting…)")
  );
}
const sc = /* @__PURE__ */ new Set(["send_message"]), ka = 1e4, cc = 500, Ca = {};
function dc() {
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
  return new Set(sc);
}
function uc(e) {
  const t = Date.now(), n = Ca[e] || 0;
  return t - n < cc ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (Ca[e] = t, !1);
}
function mc(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const i = t[r];
    return i == null ? "" : typeof i == "string" ? i : JSON.stringify(i);
  });
}
function ir(e, t = {}) {
  var a, l, s, o, d, c, u;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, i = dc();
  if (!i.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(i).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (uc(r)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const m = t.formValues || {};
    let p = ((a = n.payload) == null ? void 0 : a.content) || ((l = n.payload) == null ? void 0 : l.message) || "";
    const w = /\{\{\s*[\w.-]+\s*\}\}/.test(p);
    return p = mc(p, m).trim(), p && !w && Object.keys(m).length > 0 && (p += `
${Object.entries(m).map(([y, f]) => `${y}: ${typeof f == "string" ? f : JSON.stringify(f)}`).join(`
`)}`), !p && Object.keys(m).length > 0 && (p = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(m).map(([f, v]) => `${f}: ${typeof v == "string" ? v : JSON.stringify(v)}`).join(`
`)}`), !p || !p.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : p.length > ka ? (console.warn("[ugsci.genui] send_message: content length " + p.length + " exceeds max " + ka), { ok: !1, message: "消息内容过长" }) : !((d = (o = (s = window.QwenPaw) == null ? void 0 : s.chat) == null ? void 0 : o.sendMessage) != null && d.call(o, p)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", p), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const m = ((c = n.payload) == null ? void 0 : c.url) || ((u = n.payload) == null ? void 0 : u.href) || "", p = typeof m == "string" ? m.trim() : "";
    return /^https?:\/\//i.test(p) ? (window.open(p, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const lt = /* @__PURE__ */ new Map(), Yt = /* @__PURE__ */ new Map(), pc = 128, pn = /* @__PURE__ */ new Map();
function _n(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function fc(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function gc(e) {
  return e.startsWith("workspace://");
}
function yc(e) {
  return gc(e) ? e.slice(12) : e;
}
async function hc(e) {
  if (!e) return null;
  if (_n(e)) return e;
  if (lt.has(e))
    return lt.get(e) ?? null;
  if (pn.has(e))
    return pn.get(e);
  const t = Ec(e);
  pn.set(e, t);
  try {
    const n = await t;
    if (!lt.has(e) && lt.size >= pc) {
      const r = lt.keys().next().value;
      if (r !== void 0) {
        const i = lt.get(r);
        i != null && i.startsWith("blob:") && URL.revokeObjectURL(i), lt.delete(r);
      }
    }
    return lt.set(e, n), n && Yt.delete(e), n;
  } finally {
    pn.delete(e);
  }
}
async function Ec(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const i = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return Yt.set(e, i), console.warn("[ugsci.genui]", i), null;
  }
  const r = yc(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const i = await n.resolveWorkspaceBlob(r);
      if (i) return i;
    } catch (i) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", i);
    }
  try {
    return await bc(r, n);
  } catch (i) {
    const a = i instanceof Error ? i.message : String(i);
    return Yt.set(
      e,
      `无法读取本地媒体：${a}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      i
    ), null;
  }
}
async function bc(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, i = t == null ? void 0 : t.chatApi;
  if (fc(e) && (i != null && i.filePreviewUrl) ? n = i.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const a = {}, l = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof l == "function")
    try {
      const d = l();
      d && typeof d == "object" && Object.assign(a, d);
    } catch {
    }
  const s = await fetch(n, { headers: a });
  if (!s.ok)
    throw new Error(`HTTP ${s.status}: ${s.statusText}`);
  const o = await s.blob();
  return URL.createObjectURL(o);
}
function Ta(e) {
  return e ? _n(e) ? e : lt.get(e) ?? null : null;
}
function Ia(e) {
  return Yt.get(e) ?? null;
}
function vc() {
  for (const e of lt.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  lt.clear(), Yt.clear();
}
const Li = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], St = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"], wc = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function be(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function nt(e) {
  if (typeof e == "number" && Number.isFinite(e)) return e;
  if (typeof e == "string") {
    const t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}
function Dt(e) {
  return Array.isArray(e) ? e : [];
}
function Jt(e) {
  return !!e;
}
function Qt(e) {
  const t = e.props || {}, n = be(t.name);
  if (n) return n;
  const r = be(t.label), i = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return i ? i[1].toLowerCase() : r || be(e.nodeId);
}
function Bi(e) {
  return Li.includes(e);
}
function ji(e) {
  return Math.min(Math.max(nt(e) || 2, 1), 4);
}
function Sc(e, t, n = 6) {
  const r = nt(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function xc(e) {
  const n = (be(e) || "16:9").split(":"), r = Number(n[0]), i = Number(n[1]);
  return r > 0 && i > 0 ? `${r} / ${i}` : "16 / 9";
}
function _c(e) {
  return /^https?:\/\//i.test(be(e).trim());
}
function tt(e, t) {
  const n = {}, r = `${nt(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${nt(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = be(t.align)), t.justify && (n.justifyContent = be(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const i = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, a = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${Sc(t.columns, i, a)}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${nt(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${nt(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${nt(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = xc(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${nt(t.size) || 16}px`);
  return n;
}
function Sr(e, t) {
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
  function i(u) {
    return Array.isArray(u) ? u : [];
  }
  const a = e.generator && typeof e.generator == "object" ? e.generator : {}, l = i(a.coefficients).map(n).filter(Boolean), s = n(a.type) === "polynomial" || l.length > 0;
  let o = i(e.categories).map(n), d = i(e.series);
  if (s && t) {
    const u = l.length > 0 ? l : ["a", "b", "c", "d", "e"], m = typeof a.xMin == "number" ? a.xMin : -3, p = typeof a.xMax == "number" ? a.xMax : 3, w = Math.min(Math.max(r(a.samples) || 61, 10), 400), g = Array.from({ length: w }, (f, v) => m + (p - m) * v / Math.max(w - 1, 1)), y = u.map((f) => r(t[f]));
    o = g.map((f) => Number(f.toFixed(2)).toString()), d = [{
      name: n(a.label) || "f(x)",
      values: g.map((f) => y.reduce((v, S, b) => v + S * Math.pow(f, y.length - b - 1), 0))
    }];
  }
  const c = d.map((u, m) => {
    const p = u && typeof u == "object" ? u : {};
    return {
      name: n(p.name) || `Series ${m + 1}`,
      values: i(p.values).map(r)
    };
  });
  return {
    title: n(e.title),
    chartType: n(e.chart) || "line",
    categories: o,
    series: c,
    height: r(e.height) || 200,
    showLegend: e.showLegend !== !1,
    empty: o.length === 0 || c.length === 0
  };
}
function Ui(e, t, n = 640) {
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
    const p = t.series[0].values.map((S) => Math.abs(S)), w = p.reduce((S, b) => S + b, 0) || 1, g = n / 2, y = i / 2, f = Math.min(n, i) / 2 - 20;
    let v = -Math.PI / 2;
    if (p.forEach((S, b) => {
      const x = S / w * Math.PI * 2, R = g + f * Math.cos(v), J = y + f * Math.sin(v), P = g + f * Math.cos(v + x), j = y + f * Math.sin(v + x), X = document.createElementNS(a.namespaceURI, "path");
      X.setAttribute("d", `M ${g} ${y} L ${R} ${J} A ${f} ${f} 0 ${x > Math.PI ? 1 : 0} 1 ${P} ${j} Z`), X.setAttribute("fill", r[b % r.length]), a.appendChild(X), v += x;
    }), e.appendChild(a), t.showLegend) {
      const S = document.createElement("div");
      S.className = "legend", p.forEach((b, x) => {
        const R = document.createElement("span"), J = document.createElement("i");
        J.style.background = r[x % r.length], R.append(J, document.createTextNode(`${t.categories[x] || `#${x + 1}`}: ${b}`)), S.appendChild(R);
      }), e.appendChild(S);
    }
    return;
  }
  const l = t.series.flatMap((p) => p.values), s = Math.max(...l, 0), o = Math.min(...l, 0), d = s - o || 1, c = (p) => i - 24 - (p - o) / d * (i - 44), u = (p) => 30 + p * (n - 50) / Math.max(t.categories.length - 1, 1), m = document.createElementNS(a.namespaceURI, "line");
  if (m.setAttribute("x1", "30"), m.setAttribute("x2", String(n - 15)), m.setAttribute("y1", String(c(0))), m.setAttribute("y2", String(c(0))), m.setAttribute("stroke", "#d9d9d9"), a.appendChild(m), t.series.forEach((p, w) => {
    const g = r[w % r.length];
    if (t.chartType === "bar") {
      const v = (n - 50) / Math.max(t.categories.length, 1), S = Math.max(1, v / t.series.length - 3);
      p.values.forEach((b, x) => {
        const R = document.createElementNS(a.namespaceURI, "rect"), J = Math.min(c(b), c(0)), P = Math.max(c(b), c(0));
        R.setAttribute("x", String(30 + x * v + w * (S + 2))), R.setAttribute("y", String(J)), R.setAttribute("width", String(S)), R.setAttribute("height", String(Math.max(1, P - J))), R.setAttribute("fill", g), a.appendChild(R);
      });
      return;
    }
    const y = p.values.map((v, S) => `${u(S)},${c(v)}`).join(" "), f = document.createElementNS(a.namespaceURI, "polyline");
    f.setAttribute("points", y), f.setAttribute("fill", t.chartType === "area" ? `${g}22` : "none"), f.setAttribute("stroke", g), f.setAttribute("stroke-width", "2"), a.appendChild(f);
  }), e.appendChild(a), t.showLegend) {
    const p = document.createElement("div");
    p.className = "legend", t.series.forEach((w, g) => {
      const y = document.createElement("span"), f = document.createElement("i");
      f.style.background = r[g % r.length], y.append(f, document.createTextNode(w.name)), p.appendChild(y);
    }), e.appendChild(p);
  }
}
const kc = {
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
}, Cc = {
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
function Ni(e) {
  const t = be(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = Cc[n];
  return r ? { kind: "svg", paths: kc[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function Tc(e, t, n = {}) {
  const r = Ni(t), i = n.size && n.size > 0 ? n.size : 16;
  if (e.setAttribute("aria-hidden", "true"), e.replaceChildren(), r.kind === "emoji") {
    e.textContent = r.text, e.style.fontSize = `${i}px`, n.color && (e.style.color = n.color);
    return;
  }
  if (r.kind === "empty") return;
  const a = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  a.setAttribute("width", String(i)), a.setAttribute("height", String(i)), a.setAttribute("viewBox", "0 0 24 24"), a.setAttribute("fill", "none"), a.setAttribute("stroke", n.color || "currentColor"), a.setAttribute("stroke-width", "2"), a.setAttribute("stroke-linecap", "round"), a.setAttribute("stroke-linejoin", "round"), a.setAttribute("focusable", "false"), a.style.display = "block";
  for (const l of r.paths) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "path");
    s.setAttribute("d", l), a.appendChild(s);
  }
  e.appendChild(a);
}
let Wn = null;
function On(e) {
  return Wn || (Wn = e.createContext(null)), Wn;
}
function Di(e, t = {}) {
  if (Bi(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[Qt(e)] = r);
  }
  for (const n of e.children || []) Di(n, t);
  return t;
}
function Ic({
  node: e,
  children: t,
  onValuesChange: n
}) {
  var o, d;
  const r = (d = (o = window.QwenPaw) == null ? void 0 : o.host) == null ? void 0 : d.React;
  if (!r) return null;
  const i = r.useMemo(() => Di(e), [e]), [a, l] = r.useState(i);
  r.useEffect(
    () => l((c) => ({ ...i, ...c })),
    [i]
  ), r.useEffect(() => {
    n == null || n(a);
  }, [a, n]);
  const s = r.useMemo(
    () => ({
      values: a,
      setValue: (c, u) => l((m) => ({ ...m, [c]: u }))
    }),
    [a]
  );
  return r.createElement(
    On(r).Provider,
    { value: s },
    t
  );
}
const Z = (e) => typeof e == "string" ? e : e != null ? String(e) : "", pt = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, ft = (e) => !!e, Ft = (e) => Array.isArray(e) ? e : [], $c = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((i) => Object.is(e[i], t[i]));
}, $a = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, Te = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
}, zc = new Set(Li);
function Ac(e) {
  const t = [], n = (r) => {
    zc.has(r.kind) && t.push(r);
    for (const i of r.children || []) n(i);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let Hn = null;
function xr(e) {
  return Hn || (Hn = e.createContext(null)), Hn;
}
function Pc({ node: e }) {
  var w;
  const t = (w = window.QwenPaw) == null ? void 0 : w.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const i = e.props || {}, a = n.useContext(On(n)), [l, s] = n.useState({}), [o, d] = n.useState(null), c = n.useMemo(
    () => Ac(e),
    [e]
  ), u = n.useMemo(() => {
    const g = {};
    for (const y of c) {
      const f = y.props || {}, v = Qt(y);
      f.value !== void 0 ? g[v] = f.value : f.checked !== void 0 && (g[v] = f.checked);
    }
    return g;
  }, [c]);
  n.useEffect(() => s((g) => {
    const y = { ...u, ...g, ...(a == null ? void 0 : a.values) || {} };
    return $c(g, y) ? g : y;
  }), [u, a == null ? void 0 : a.values]);
  const m = n.useMemo(() => ({ values: l, setValue: (g, y) => {
    d(null), s((f) => ({ ...f, [g]: y })), a == null || a.setValue(g, y);
  } }), [l, a]), p = () => {
    var f, v;
    const g = c.filter((S) => {
      var b;
      return (b = S.props) == null ? void 0 : b.required;
    }).find((S) => {
      const b = Qt(S), x = l[b];
      return x == null || x === "" || Array.isArray(x) && x.length === 0;
    });
    if (g) {
      d({ ok: !1, message: `${Z((f = g.props) == null ? void 0 : f.label) || Z((v = g.props) == null ? void 0 : v.name) || "必填项"}不能为空` });
      return;
    }
    const y = i.action && typeof i.action == "object" ? i.action : { type: "submit_form", payload: {} };
    d(ir(y, { formValues: l, formId: Z(i.formId) || e.nodeId }));
  };
  return n.createElement(
    xr(n).Provider,
    { value: m },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      i.title ? n.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, Z(i.title)) : null,
      ...(e.children || []).map((g, y) => n.createElement(Zt(n), { key: g.nodeId || y, node: g })),
      n.createElement(r.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: p }, Z(i.submitLabel) || "提交"),
      o ? n.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: o.ok ? Te.success : Te.error } }, o.message) : null
    )
  );
}
function Rc({ node: e, fieldType: t }) {
  var f, v, S;
  const n = (f = window.QwenPaw) == null ? void 0 : f.host, r = n == null ? void 0 : n.React, i = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const a = e.props || {}, l = r.useContext(xr(r)), s = r.useContext(On(r)), o = l || s, [d, c] = r.useState(a.value ?? a.checked ?? ""), u = Qt(e), m = a.value ?? a.checked ?? "", p = o ? ((v = o.values) == null ? void 0 : v[u]) ?? m : d, w = (b) => {
    const x = b != null && b.target ? t === "Switch" ? b.target.checked : b.target.value : b;
    o ? o.setValue(u, x) : c(x);
  }, g = (b) => r.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    a.label && t !== "Switch" ? r.createElement("label", { style: { fontSize: 12, color: Te.muted } }, Z(a.label), a.required ? r.createElement("span", { style: { color: Te.error } }, " *") : null) : null,
    b,
    a.description ? r.createElement("span", { style: { fontSize: 11, color: Te.muted } }, Z(a.description)) : null
  ), y = Z(a.label) || Z(a.placeholder) || u;
  return t === "Input" ? g(r.createElement(i.Input || "input", { "aria-label": y, placeholder: Z(a.placeholder), value: p, onChange: w, size: "small" })) : t === "NumberInput" ? g(r.createElement(i.InputNumber || "input", { "aria-label": y, value: p, min: a.min, max: a.max, step: a.step, onChange: w, size: "small", style: { width: "100%" } })) : t === "Textarea" ? g(r.createElement(((S = i.Input) == null ? void 0 : S.TextArea) || "textarea", { "aria-label": y, placeholder: Z(a.placeholder), value: p, rows: pt(a.rows) || 3, onChange: w, style: { width: "100%" } })) : t === "Select" ? g(r.createElement(i.Select || "select", { "aria-label": y, placeholder: Z(a.placeholder), value: p || void 0, onChange: w, size: "small", style: { width: "100%" } }, Ft(a.options).map((b, x) => {
    var R;
    return r.createElement(((R = i.Select) == null ? void 0 : R.Option) || "option", { key: x, value: Z(typeof b == "object" ? b.value : b) }, Z(typeof b == "object" ? b.label : b));
  }))) : t === "Switch" ? r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(i.Switch || "input", { type: "checkbox", checked: !!p, onChange: w, size: "small" }), r.createElement("span", null, Z(a.label))) : t === "Slider" ? g(r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(i.Slider || "input", { type: "range", value: pt(p), min: a.min ?? 0, max: a.max ?? 100, step: a.step ?? 1, onChange: w, style: { flex: 1 } }), r.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, Z(p)))) : t === "FileInput" ? r.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    r.createElement("span", null, Z(a.label) || "选择文件"),
    r.createElement("input", { type: "file", multiple: ft(a.multiple), accept: Z(a.accept) || void 0, onChange: (b) => o == null ? void 0 : o.setValue(u, Array.from(b.target.files || []).map((x) => ({ name: x.name, size: x.size, type: x.type }))) })
  ) : null;
}
function qn({ node: e, link: t = !1, toggle: n = !1 }) {
  var p;
  const r = (p = window.QwenPaw) == null ? void 0 : p.host, i = r == null ? void 0 : r.React, a = (r == null ? void 0 : r.antd) || {};
  if (!i) return null;
  const l = e.props || {}, s = i.useContext(xr(i)), [o, d] = i.useState(ft(l.checked)), [c, u] = i.useState(null), m = () => {
    n && d((w) => !w), l.action && typeof l.action == "object" ? u(ir(l.action, { formValues: s == null ? void 0 : s.values, formId: s ? "form" : void 0 })) : t && typeof l.href == "string" && u(ir({ type: "open_url", payload: { url: l.href } }));
  };
  return i.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    i.createElement(a.Button || "button", { type: t ? "link" : (n ? o : Z(l.variant) === "primary") ? "primary" : "default", size: "small", disabled: ft(l.disabled), loading: ft(l.loading), onClick: m }, Z(l.label) || "Action"),
    c ? i.createElement("span", { role: "status", style: { fontSize: 11, color: c.ok ? Te.success : Te.error } }, c.message) : null
  );
}
let za = null, fn = null;
function Oc(e) {
  return fn && za === e || (za = e, fn = class extends e.Component {
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
  }), fn;
}
function Mc({ node: e }) {
  var o;
  const t = (o = window.QwenPaw) == null ? void 0 : o.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, i = Zt(n), a = e.props || {}, l = e.children || [];
  return Bc(n, r, e, a, l, () => l.map(
    (d, c) => n.createElement(i, { key: d.nodeId || c, node: d })
  ));
}
let gn = null, Aa = null;
function Zt(e) {
  return gn && Aa === e || (gn = e.memo(Mc, (t, n) => t.node === n.node), Aa = e), gn;
}
function Lc({ node: e }) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    Oc(n),
    { node: e },
    n.createElement(Zt(n), { node: e })
  );
}
function Bc(e, t, n, r, i, a) {
  var l, s;
  switch (n.kind) {
    case "Stack":
      return e.createElement("div", { style: tt("Stack", r) }, a());
    case "Row":
      return e.createElement("div", { style: tt("Row", r) }, a());
    case "Grid":
      return e.createElement("div", { style: tt("Grid", r) }, a());
    case "Spacer":
      return e.createElement("div", { style: tt("Spacer", r) });
    case "ScrollArea":
      return e.createElement("div", { style: tt("ScrollArea", r) }, a());
    case "AspectBox":
      return e.createElement("div", { style: tt("AspectBox", r) }, a());
    case "Text":
      return e.createElement("div", { style: { fontSize: $a[Z(r.size)] || $a.base, color: Te[Z(r.color)] || Te.default, fontWeight: ft(r.bold) ? "bold" : "normal", lineHeight: 1.6 } }, Z(r.value));
    case "Heading": {
      const o = ji(r.level), d = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement(`h${o}`, { style: { fontSize: d[o], fontWeight: "bold", margin: "4px 0" } }, Z(r.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", r.label ? { children: Z(r.label) } : {});
    case "Markdown": {
      const o = (l = window.QwenPaw) == null ? void 0 : l.host, d = o == null ? void 0 : o.ReactMarkdown;
      if (d) {
        const c = o != null && o.remarkGfm ? [o.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(d, { children: Z(r.content || r.value), remarkPlugins: c })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, Z(r.content || r.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, Z(r.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, r.icon ? e.createElement("span", { style: { fontSize: 20 } }, Z(r.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, Z(r.title)), r.subtitle ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Z(r.subtitle)) : null));
    case "KeyValueList": {
      const o = Ft(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...o.map((d, c) => e.createElement(
          "div",
          { key: c, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: c < o.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: Te.muted, fontSize: 13 } }, Z(d.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, Z(d.value))
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
      return e.createElement(t.Progress || "div", { percent: pt(r.value), size: "small" });
    case "Skeleton": {
      const o = pt(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: o }).map(
          (d, c) => e.createElement(t.Skeleton || "div", { key: c, active: ft(r.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(Uc, {
        src: Z(r.src),
        name: Z(r.name),
        size: pt(r.size) || 32
      });
    case "Icon": {
      const o = Ni(r.name), d = pt(r.size) || 16, c = Te[Z(r.color)] || Te.default;
      return o.kind === "emoji" ? e.createElement("span", { "aria-hidden": !0, style: { fontSize: d, color: c, lineHeight: 1 } }, o.text) : o.kind === "svg" ? e.createElement("svg", {
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
      }, ...o.paths.map((u, m) => e.createElement("path", { key: m, d: u }))) : e.createElement("span", { "aria-hidden": !0, style: { width: d, height: d, display: "inline-block" } });
    }
    case "Card":
      return e.createElement(t.Card || "div", { title: r.title ? Z(r.title) : void 0, size: "small", style: { margin: "4px 0" } }, a());
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
      return e.createElement("div", { style: { margin: "4px 0" } }, r.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, Z(r.title)) : null, e.createElement("div", { style: tt("KpiBoard", r) }, a()));
    case "FeatureGrid":
      return e.createElement("div", { style: { ...tt("FeatureGrid", r), margin: "4px 0" } }, a());
    case "Stepper": {
      const o = Ft(r.steps).map((c) => Z(c)), d = pt(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: d, size: "small", style: { margin: "4px 0" } },
        ...o.map((c, u) => {
          var m;
          return e.createElement(((m = t.Steps) == null ? void 0 : m.Item) || "div", { key: u, title: c });
        })
      );
    }
    case "Table": {
      const o = Ft(r.headers).map((m) => Z(m)), c = i.filter((m) => m.kind === "TableRow").map((m, p) => {
        const w = (m.children || []).filter((y) => y.kind === "TableCell"), g = { key: p };
        return o.forEach((y, f) => {
          var S, b;
          const v = (b = (S = w[f]) == null ? void 0 : S.props) == null ? void 0 : b.value;
          g[y] = v == null ? "" : Z(v);
        }), g;
      }), u = o.map((m) => ({ title: m, dataIndex: m, key: m }));
      return e.createElement(t.Table || "table", { dataSource: c, columns: u, size: ft(r.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const o = i.filter((d) => d.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        o.map((d, c) => {
          var u, m, p;
          return e.createElement(((u = t.List) == null ? void 0 : u.Item) || "li", { key: c }, (m = d.props) != null && m.icon ? e.createElement("span", { style: { marginRight: 6 } }, Z(d.props.icon)) : null, Z((p = d.props) == null ? void 0 : p.value));
        })
      );
    }
    case "ImageGallery": {
      const o = i.filter((d) => d.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...tt("ImageGallery", r), margin: "4px 0" } },
        ...o.map((d, c) => {
          const u = d.props || {};
          return e.createElement(lr, { key: c, src: Z(u.src), alt: Z(u.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(lr, { src: Z(r.src), alt: Z(r.alt), style: { maxWidth: "100%", borderRadius: ft(r.rounded) ? "8px" : void 0, maxHeight: r.maxHeight ? `${pt(r.maxHeight)}px` : void 0 } }), r.caption ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Z(r.caption)) : null);
    case "Chart":
      return e.createElement(jc, { props: r });
    case "Button":
    case "InteractiveButton":
      return e.createElement(qn, { node: n });
    case "ToggleButton":
      return e.createElement(qn, { node: n, toggle: !0 });
    case "LinkButton":
      return e.createElement(qn, { node: n, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(Rc, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(Pc, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: Z(r.color) || "default", closable: !0, onClose: () => {
      }, children: Z(r.label) });
    case "ChipGroup": {
      const o = Ft(r.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...o.map((d, c) => e.createElement(t.Tag || "span", { key: c }, Z(d))));
    }
    case "Tabs": {
      const o = Zt(e), c = i.filter((u) => u.kind === "TabItem").map((u) => {
        var m, p, w;
        return {
          key: Z((m = u.props) == null ? void 0 : m.key) || Z((p = u.props) == null ? void 0 : p.tab),
          label: Z((w = u.props) == null ? void 0 : w.tab),
          children: (u.children || []).map((g, y) => e.createElement(o, { key: g.nodeId || y, node: g }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: c, defaultActiveKey: Z(r.activeKey) || ((s = c[0]) == null ? void 0 : s.key) }) : e.createElement("div", null, ...c.map((u, m) => e.createElement("div", { key: m }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, u.label), u.children)));
    }
    case "TabItem":
      return e.createElement("div", null, a());
    case "Accordion": {
      const o = Zt(e), d = i.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = d.map((u) => {
          var m, p, w;
          return {
            key: Z((m = u.props) == null ? void 0 : m.key) || Z((p = u.props) == null ? void 0 : p.header),
            label: Z((w = u.props) == null ? void 0 : w.header),
            children: (u.children || []).map((g, y) => e.createElement(o, { key: g.nodeId || y, node: g }))
          };
        });
        return e.createElement(t.Collapse, { items: c });
      }
      return e.createElement("div", null, ...d.map((c, u) => {
        var m;
        return e.createElement("details", { key: u }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, Z((m = c.props) == null ? void 0 : m.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (c.children || []).map((p, w) => e.createElement(o, { key: p.nodeId || w, node: p }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, a());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, Z(r.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(r.data ?? r, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: Te.muted, fontFamily: "monospace" } }, `Unknown component: ${n.kind}`);
  }
}
function jc({ props: e }) {
  var R, J;
  const t = (J = (R = window.QwenPaw) == null ? void 0 : R.host) == null ? void 0 : J.React;
  if (!t) return null;
  const n = t.useContext(On(t)), r = Sr(e, n == null ? void 0 : n.values), i = r.chartType, a = r.title, l = r.categories, s = r.series, o = r.height, d = r.showLegend, c = 400;
  if (r.empty)
    return t.createElement("div", { style: { padding: 12, color: Te.muted, fontSize: 12 } }, "Chart: no data");
  if (i === "pie") {
    const P = s[0].values.map((M) => Math.abs(M)), j = P.reduce((M, _) => M + _, 0) || 1, X = c / 2, q = o / 2, U = Math.min(c, o) / 2 - 20;
    let $ = -Math.PI / 2;
    const A = P.map((M, _) => {
      const O = M / j * 2 * Math.PI, D = X + U * Math.cos($), Y = q + U * Math.sin($), z = X + U * Math.cos($ + O), C = q + U * Math.sin($ + O), te = O > Math.PI ? 1 : 0, re = `M ${X} ${q} L ${D} ${Y} A ${U} ${U} 0 ${te} 1 ${z} ${C} Z`;
      return $ += O, { path: re, color: St[_ % St.length], label: l[_] || `#${_ + 1}`, val: M };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, a) : null,
      t.createElement(
        "svg",
        { width: c, height: o, style: { maxWidth: "100%" } },
        ...A.map((M, _) => t.createElement("path", { key: _, d: M.path, fill: M.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      d ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...A.map((M, _) => t.createElement(
          "span",
          { key: _, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: M.color } }),
          `${M.label}: ${M.val}`
        ))
      ) : null
    );
  }
  const u = s.flatMap((P) => P.values), m = Math.max(...u, 0), p = Math.min(...u, 0), w = m - p || 1, g = l.length > 0 ? (c - 40) / l.length : 0, y = s.length > 0 ? Math.max(1, g / s.length - 2) : 0, f = l.length > 1 ? (c - 40) / (l.length - 1) : 0, v = Math.max(1, Math.ceil(l.length / 8)), S = (P) => o - 20 - (P - p) / w * (o - 40), b = S(0), x = (P) => 30 + P * f;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    a ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, a) : null,
    t.createElement(
      "svg",
      { width: c, height: o, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((P, j) => {
        const X = o - 20 - P * (o - 40);
        return t.createElement("line", { key: `g${j}`, x1: 30, y1: X, x2: c - 10, y2: X, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...l.map((P, j) => j % v === 0 || j === l.length - 1 ? t.createElement("text", { key: `x${j}`, x: x(j), y: o - 6, fontSize: 10, fill: Te.muted, textAnchor: "middle" }, P.length > 6 ? P.slice(0, 6) + "…" : P) : null),
      ...s.map((P, j) => {
        const X = St[j % St.length];
        if (i === "bar")
          return P.values.map(($, A) => t.createElement("rect", {
            key: `b${j}-${A}`,
            x: 30 + A * g + j * (y + 2) + 1,
            y: Math.min(S($), b),
            width: y,
            height: Math.abs(b - S($)),
            fill: X,
            rx: 2
          }));
        const q = P.values.map(($, A) => `${x(A)},${S($)}`).join(" "), U = [t.createElement("polyline", { key: `l${j}`, points: q, fill: "none", stroke: X, strokeWidth: 2 })];
        if (i === "area") {
          const $ = `${x(0)},${o - 20} ${q} ${x(P.values.length - 1)},${o - 20}`;
          U.unshift(t.createElement("polygon", { key: `a${j}`, points: $, fill: X, opacity: 0.15 }));
        }
        return U;
      })
    ),
    d ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...s.map((P, j) => t.createElement(
        "span",
        { key: j, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: St[j % St.length] } }),
        P.name
      ))
    ) : null
  );
}
function lr(e) {
  var d;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: i } = n, [a, l] = r(
    Ta(e.src) || (_n(e.src) ? e.src : null)
  ), [s, o] = r(
    Ia(e.src)
  );
  return i(() => {
    if (!e.src) return;
    if (_n(e.src)) {
      l(e.src), o(null);
      return;
    }
    const c = Ta(e.src);
    if (c) {
      l(c), o(null);
      return;
    }
    l(null), o(null);
    let u = !1;
    return hc(e.src).then((m) => {
      u || (l(m), o(m ? null : Ia(e.src)));
    }), () => {
      u = !0;
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
function Uc(e) {
  var i, a, l;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  return n ? e.src ? n.createElement(lr, {
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
    ((l = (a = e.name) == null ? void 0 : a.charAt(0)) == null ? void 0 : l.toUpperCase()) || ""
  ) : null;
}
const Nc = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
@media print { body { padding: 0; } }`, Pa = {
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
function Dc(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function Fc(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function ee(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = be(n)), r;
}
function yn(e, t) {
  Object.assign(e.style, t);
}
function jt(e, t, n) {
  for (const r of t || []) e.appendChild(_r(r, n));
  return e;
}
function Ra(e, t, n) {
  return t && e.appendChild(ee("div", "muted small", t)), e.appendChild(ee("div", "display-value", n)), e;
}
function Fi(e, t, n, r) {
  const i = be(e);
  if (r.missing.has(i)) {
    const l = ee("div", `media-unavailable ${n}`.trim(), "此媒体未能离线嵌入");
    return l.setAttribute("role", "img"), l.setAttribute("aria-label", be(t)), l;
  }
  const a = ee("img", n);
  return a.src = r.media[i] || i, a.alt = be(t), a;
}
function Gc(e, t, n) {
  return e ? Fi(e, t, "avatar", n) : ee("span", "avatar avatar-fallback", be(t).charAt(0).toUpperCase());
}
function Wc(e) {
  const t = ee("div", "markdown");
  let n = null;
  for (const r of be(e).split(/\r?\n/)) {
    const i = r.match(/^(#{1,4})\s+(.*)$/), a = r.match(/^\s*[-*]\s+(.*)$/);
    i ? (n = null, t.appendChild(ee(`h${i[1].length}`, "", i[2]))) : a ? (n || (n = ee("ul"), t.appendChild(n)), n.appendChild(ee("li", "", a[1]))) : r.trim() ? (n = null, t.appendChild(ee("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function Hc(e, t) {
  const n = e.props || {}, r = e.kind, i = Qt(e), a = ee("label", "field");
  n.label && r !== "Switch" && a.appendChild(ee("span", "field-label", `${be(n.label)}${n.required ? " *" : ""}`));
  let l;
  if (r === "Textarea") {
    const o = ee("textarea");
    o.rows = nt(n.rows) || 3, o.placeholder = be(n.placeholder), l = o;
  } else if (r === "Select") {
    const o = ee("select");
    for (const d of Dt(n.options)) {
      const c = ee("option"), u = d && typeof d == "object" ? d : null;
      c.value = be(u ? u.value : d), c.textContent = be(u ? u.label : d), o.appendChild(c);
    }
    l = o;
  } else {
    const o = ee("input");
    o.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (o.min = be(n.min)), n.max != null && (o.max = be(n.max)), n.step != null && (o.step = be(n.step)), r === "FileInput" ? (n.accept && (o.accept = be(n.accept)), o.multiple = Jt(n.multiple)) : o.placeholder = be(n.placeholder), l = o;
  }
  const s = Object.prototype.hasOwnProperty.call(t.values, i) ? t.values[i] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const o = l;
    o.checked = Jt(s), o.checked ? o.setAttribute("checked", "") : o.removeAttribute("checked");
  } else if (r === "Textarea")
    l.value = be(s), l.textContent = be(s);
  else if (r === "Select") {
    const o = be(s);
    l.value = o;
    for (const d of Array.from(l.options))
      d.value === o ? d.setAttribute("selected", "") : d.removeAttribute("selected");
  } else r !== "FileInput" && (l.value = be(s), l.setAttribute("value", be(s)));
  if (l.setAttribute("data-genui-field", i), l.setAttribute("data-genui-kind", r), r === "Switch") {
    const o = ee("span", "switch-line");
    o.append(l, ee("span", "", n.label)), a.appendChild(o);
  } else if (r === "Slider") {
    const o = ee("span", "slider-line");
    o.append(l, ee("output", "slider-value", s)), a.appendChild(o);
  } else
    a.appendChild(l);
  return n.description && a.appendChild(ee("small", "description", n.description)), a;
}
function _r(e, t) {
  var a, l, s, o, d, c, u;
  if (!e || typeof e != "object") return ee("div");
  const n = e.props || {}, r = e.children || [];
  if (Bi(e.kind)) return Hc(e, t);
  if (e.kind === "Chart") {
    const m = ee("div", "chart");
    return m.setAttribute("data-genui-chart", JSON.stringify(n)), Ui(m, Sr(n, t.values)), m;
  }
  if (e.kind === "Heading") return ee(`h${ji(n.level)}`, "", n.value);
  if (e.kind === "Text") return ee("div", Jt(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown") return Wc(n.content || n.value);
  if (e.kind === "CodeBlock") return ee("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const m = ee("div", "section-header");
    n.icon && m.appendChild(ee("span", "section-icon", n.icon));
    const p = ee("div");
    return p.appendChild(ee("strong", "", n.title)), n.subtitle && p.appendChild(ee("div", "muted small", n.subtitle)), m.appendChild(p), m;
  }
  if (e.kind === "KeyValueList") {
    const m = ee("dl", "key-values");
    for (const p of Dt(n.items)) {
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
    return yn(m, tt("Spacer", n)), m;
  }
  if (e.kind === "Tabs") {
    const m = ee("div", "tabs");
    m.setAttribute("data-genui-tabs", "1");
    const p = ee("div", "tab-buttons"), w = ee("div");
    return r.filter((y) => y.kind === "TabItem").forEach((y, f) => {
      var v;
      p.appendChild(ee("button", f ? "" : "active", (v = y.props) == null ? void 0 : v.tab)), w.appendChild(jt(ee("div", f ? "tab-panel hidden" : "tab-panel"), y.children, t));
    }), m.append(p, w), m;
  }
  if (e.kind === "Accordion") {
    const m = ee("div");
    for (const p of r.filter((w) => w.kind === "AccordionItem")) {
      const w = ee("details");
      w.append(ee("summary", "", (a = p.props) == null ? void 0 : a.header), jt(ee("div", "accordion-body"), p.children, t)), m.appendChild(w);
    }
    return m;
  }
  if (e.kind === "Form") {
    const m = ee("div", "stack form");
    n.title && m.appendChild(ee("div", "card-title", n.title)), jt(m, r, t);
    const p = ee("button", "button", be(n.submitLabel) || "提交");
    return p.setAttribute("data-genui-submit", "1"), m.appendChild(p), m;
  }
  if (wc.has(e.kind)) {
    const m = ee("button", e.kind === "LinkButton" ? "link-button" : "button", be(n.label) || "Action");
    return Jt(n.disabled) && (m.disabled = !0), m.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && _c(n.href) && m.setAttribute("data-genui-href", be(n.href).trim()), m;
  }
  if (e.kind === "Image") {
    const m = ee("figure");
    return m.appendChild(Fi(n.src, n.alt, "", t)), n.caption && m.appendChild(ee("figcaption", "", n.caption)), m;
  }
  if (e.kind === "ImageGallery") {
    const m = ee("div", "image-gallery");
    yn(m, tt("ImageGallery", n));
    for (const p of r.filter((w) => w.kind === "Image"))
      m.appendChild(_r(p, t));
    return m;
  }
  if (e.kind === "Avatar") return Gc(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return ee("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const m = ee("progress");
    return m.max = 100, m.value = nt(n.value), m;
  }
  if (e.kind === "Stat") {
    const m = ee("div", "stat");
    return m.append(ee("span", "muted small", n.label), ee("strong", "stat-value", n.value)), n.delta && m.appendChild(ee("span", `small trend-${be(n.trend)}`, n.delta)), m;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const m = ee("div", "card metric-card"), p = Ra(ee("div"), n.title, n.value);
    return n.delta && p.appendChild(ee("div", `small trend-${be(n.trend)}`, `${be(n.delta)}${n.period ? ` ${be(n.period)}` : ""}`)), m.appendChild(p), n.icon && m.appendChild(ee("span", "metric-icon", n.icon)), m;
  }
  if (e.kind === "TimelineCard") {
    const m = ee("div", "card timeline");
    return m.append(ee("i", `timeline-dot status-${be(n.status)}`), Ra(ee("div"), n.title, n.date)), n.description && m.appendChild(ee("div", "small", n.description)), m;
  }
  if (e.kind === "Stepper") {
    const m = ee("ol", "stepper");
    return Dt(n.steps).forEach((p, w) => {
      m.appendChild(ee("li", w <= nt(n.current) ? "active" : "", p));
    }), m;
  }
  if (e.kind === "Table") {
    const m = ee("table", "data-table"), p = ee("thead"), w = ee("tr");
    for (const y of Dt(n.headers)) w.appendChild(ee("th", "", y));
    p.appendChild(w);
    const g = ee("tbody");
    for (const y of r.filter((f) => f.kind === "TableRow")) {
      const f = ee("tr", (l = y.props) != null && l.highlight ? "highlight" : "");
      for (const v of (y.children || []).filter((S) => S.kind === "TableCell")) {
        const S = ee("td", (s = v.props) != null && s.bold ? "bold" : "", (o = v.props) == null ? void 0 : o.value);
        (d = v.props) != null && d.align && (S.style.textAlign = be(v.props.align)), f.appendChild(S);
      }
      g.appendChild(f);
    }
    return m.append(p, g), m;
  }
  if (e.kind === "List") {
    const m = ee(Jt(n.ordered) ? "ol" : "ul", "data-list");
    for (const p of r.filter((w) => w.kind === "ListItem"))
      m.appendChild(ee("li", "", `${(c = p.props) != null && c.icon ? `${be(p.props.icon)} ` : ""}${be((u = p.props) == null ? void 0 : u.value)}`));
    return m;
  }
  if (e.kind === "ChipGroup") {
    const m = ee("div", "chips");
    for (const p of Dt(n.items)) m.appendChild(ee("span", "tag", p));
    return m;
  }
  if (e.kind === "Skeleton") {
    const m = ee("div", "skeletons");
    for (let p = 0; p < (nt(n.rows) || 3); p += 1) m.appendChild(ee("i", "skeleton"));
    return m;
  }
  if (e.kind === "Icon") {
    const m = ee("span", "icon");
    return Tc(m, n.name, { size: nt(n.size) || 16 }), m;
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
    return yn(p, tt("KpiBoard", n)), jt(p, r, t), m.appendChild(p), m;
  }
  if (!Object.prototype.hasOwnProperty.call(Pa, e.kind))
    return ee("div", "unknown-component", `Unknown component: ${be(e.kind)}`);
  const i = ee("div", Pa[e.kind]);
  return yn(i, tt(e.kind, n)), e.kind === "Card" && n.title && i.appendChild(ee("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && i.appendChild(ee("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && i.appendChild(ee("strong", "", n.title)), n.message && i.appendChild(ee("div", "", n.message))) : jt(i, r, t), i;
}
function Oa(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function qc() {
  return `(function () {
  "use strict";
  ${Oa(Sr, "resolveChartModel")}
  ${Oa(Ui, "paintChartElement")}
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
function Vc(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = ee("main");
  return r.id = "genui-root", r.appendChild(_r(e, {
    values: t,
    media: n.sources || {},
    missing: new Set(n.missing || [])
  })), r;
}
function Gi(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const i = Vc(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${Dc(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${Nc}
  </style>
</head>
<body>${i.outerHTML}
<script id="genui-values-data" type="application/json">${Fc(t)}<\/script>
<script>${qc()}<\/script></body>
</html>`;
}
function Wi(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function Jc(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => Ou), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  Wi(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", { filename: t, via: "html-to-image" });
}
function Kc(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function Xc(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await Kc(await n.blob()) : null;
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
async function Hi(e) {
  const t = {}, n = [], r = Array.from(e.querySelectorAll("img[data-genui-media-source]"));
  return await Promise.all(r.map(async (i) => {
    const a = i.dataset.genuiMediaSource || "", l = await Xc(i);
    a && (l ? t[a] = l : n.push(a));
  })), { sources: t, missing: Array.from(new Set(n)) };
}
async function Yc(e, t, n, r, i = r) {
  const a = await Hi(e), l = Gi(t, n, a, i), s = new Blob([l], { type: "text/html;charset=utf-8" }), o = URL.createObjectURL(s);
  Wi(o, `${r}.html`), setTimeout(() => URL.revokeObjectURL(o), 1e3), a.missing.length && console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename: r, missing: a.missing }), console.info("[ugsci.genui] HTML export created", { filename: r, bytes: s.size, embeddedMedia: Object.keys(a.sources).length, missingMedia: a.missing.length });
}
async function Qc(e, t, n, r) {
  const i = await Hi(e), a = Gi(t, n, i, r), l = window.open("", "_blank", "noopener,noreferrer");
  if (!l) throw new Error("print window was blocked");
  l.document.open(), l.document.write(a), l.document.close(), await new Promise((s) => {
    const o = () => s();
    if (l.document.readyState === "complete") {
      window.setTimeout(o, 50);
      return;
    }
    l.addEventListener("load", o, { once: !0 }), window.setTimeout(o, 400);
  }), l.focus(), l.print(), l.close(), i.missing.length && console.warn("[ugsci.genui] PDF print has media that could not be embedded", { missing: i.missing });
}
const Ve = "var(--ant-color-text, rgba(0, 0, 0, 0.88))", De = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))", Ct = "var(--ant-color-border-secondary, #f0f0f0)", or = "var(--ant-color-bg-container, #fff)", sr = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))", qi = "var(--ant-color-success, #52c41a)", Zc = "var(--ant-color-success-bg, #f6ffed)", ed = "var(--ant-color-warning, #faad14)", td = "var(--ant-color-warning-bg, #fffbe6)", Vi = "var(--ant-color-error, #ff4d4f)", nd = "var(--ant-color-error-bg, #fff2f0)", Ma = "var(--ant-color-primary, #1677ff)", rd = {
  derived_expression: "推导结果",
  effective_inventory: "有效库存",
  estimated_ogip: "估算原始储量",
  initial_p_over_z: "初始 p/z",
  current_p_over_z: "当前 p/z",
  recovery_factor: "采收率",
  remaining_gas: "剩余气量",
  result: "计算结果",
  transformed_expression: "变换结果"
}, Ji = {
  current_pressure: "当前压力",
  current_z_factor: "当前 z 因子",
  initial_pressure: "初始压力",
  initial_z_factor: "初始 z 因子",
  produced_gas: "累计产气量"
};
function en(e) {
  return rd[e] || Ji[e] || e.replace(/[_.-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function ad(e, t = "") {
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
function kn(e, t = "") {
  if (typeof e == "number") return ad(e, t);
  if (typeof e == "boolean") return e ? "是" : "否";
  if (e == null) return "—";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function La(e) {
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
function id(e) {
  const t = e == null ? void 0 : e.result;
  return !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(
    ([, n]) => ["string", "number", "boolean"].includes(typeof n)
  ).sort(([n], [r]) => La(n) - La(r)).slice(0, 4).map(([n, r]) => {
    var i;
    return {
      key: n,
      label: en(n),
      value: kn(r, n),
      unit: String(((i = e == null ? void 0 : e.units) == null ? void 0 : i[n]) || "")
    };
  });
}
function ld(e) {
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
function od(e) {
  var r, i;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.variables) ? e.trace.variables.filter((a) => (a == null ? void 0 : a.source) === "input") : [];
  if (t.length)
    return t.slice(0, 8).map((a) => ({
      name: String(a.name || ""),
      label: String(
        Ji[String(a.name || "")] || a.display_name || en(String(a.name || "参数"))
      ),
      value: `${kn(a.value, a.name)}${a.unit ? ` ${a.unit}` : ""}`,
      source: "用户输入"
    }));
  const n = ((i = e == null ? void 0 : e.provenance) == null ? void 0 : i.parameter_sources) || {};
  return Object.entries(n).filter(([, a]) => (a == null ? void 0 : a.source) === "user_input").slice(0, 8).map(([a, l]) => ({
    name: a,
    label: en(a),
    value: `${kn(l == null ? void 0 : l.value, a)}${l != null && l.unit ? ` ${l.unit}` : ""}`,
    source: "用户输入"
  }));
}
function Mn(e) {
  var c, u, m, p;
  const t = (e == null ? void 0 : e.provenance) || {}, n = t.unit_audit, r = Object.values((n == null ? void 0 : n.per_symbol) || {}), i = typeof (n == null ? void 0 : n.ok) == "boolean" ? n.ok : null, a = t.source || ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.source), l = Array.isArray(e == null ? void 0 : e.warnings) ? e.warnings.map(String) : [];
  let s = "success", o = "公式与单位已核验", d = "公式匹配、参数完整，计算证据链可追溯。";
  return i === !1 ? (s = "error", o = "单位检查未通过", d = "结果使用前需要修正单位不一致项。") : a === "freeform" ? (s = "warning", o = "AI 推导 · 建议复核", d = "符号步骤已通过安全校验，但公式并非审定公式库来源。") : l.length ? (s = "warning", o = "计算完成 · 存在提醒", d = "核心计算已完成，请同时阅读警告和适用条件。") : i === null && (o = "计算证据链已记录", d = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。"), {
    title: ((u = e == null ? void 0 : e.trace) == null ? void 0 : u.formula_name) || ((m = e == null ? void 0 : e.trace) == null ? void 0 : m.title) || (e == null ? void 0 : e.operation) || "UGSci 数学计算",
    formula: ld(e),
    trustLabel: o,
    trustDetail: d,
    trustTone: s,
    results: id(e),
    inputs: od(e),
    boundaries: [
      ...Array.isArray(e == null ? void 0 : e.applicability) ? e.applicability : [],
      ...Array.isArray(e == null ? void 0 : e.assumptions) ? e.assumptions : []
    ].map(String),
    warnings: l,
    stepCount: Array.isArray((p = e == null ? void 0 : e.trace) == null ? void 0 : p.steps) ? e.trace.steps.length : 0,
    passedGateCount: Array.isArray(t.gate) ? t.gate.length : 0,
    unitCheckCount: r.length,
    unitAuditOk: i
  };
}
function sd(e) {
  return e === "error" ? { color: Vi, background: nd } : e === "warning" ? { color: ed, background: td } : { color: qi, background: Zc };
}
function Et({ children: e }) {
  return T().React.createElement(
    "div",
    { style: { fontWeight: 600, color: Ve, marginBottom: 8 } },
    e
  );
}
function kr({
  payload: e,
  onOpenDerivation: t,
  onOpenEvidence: n,
  onReplay: r,
  compact: i = !1
}) {
  const a = T().React, l = Mn(e), s = sd(l.trustTone), o = l.results[0], d = l.results.slice(1, i ? 2 : 4);
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
          { style: { color: De, fontSize: 12, marginBottom: 3 } },
          i ? "计算摘要" : l.title
        ),
        o ? a.createElement(
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
                color: Ve,
                fontSize: i ? 22 : 28,
                fontWeight: 600,
                overflowWrap: "anywhere"
              }
            },
            o.value
          ),
          o.unit ? a.createElement(
            "span",
            { style: { color: De, fontSize: 13 } },
            o.unit
          ) : null
        ) : a.createElement(
          "strong",
          { style: { color: Ve } },
          "计算已完成"
        ),
        o ? a.createElement(
          "div",
          { style: { color: De, fontSize: 12, marginTop: 3 } },
          o.label
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
            color: s.color,
            background: s.background,
            fontSize: 12,
            whiteSpace: "nowrap"
          }
        },
        l.trustTone === "success" ? "✓" : "!",
        l.trustLabel
      )
    ),
    a.createElement(
      "p",
      {
        style: {
          margin: 0,
          color: i ? De : Ve,
          fontSize: 13,
          lineHeight: 1.65
        }
      },
      l.trustDetail
    ),
    d.length ? a.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 6,
          paddingTop: 10,
          borderTop: `1px solid ${Ct}`
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
            { style: { color: De } },
            c.label
          ),
          a.createElement(
            "span",
            { style: { color: Ve, textAlign: "right" } },
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
          borderTop: `1px solid ${Ct}`,
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
          { style: { color: De } },
          "使用公式"
        ),
        a.createElement(
          "code",
          { style: { color: Ve, overflowWrap: "anywhere" } },
          l.formula
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
          { style: { color: De } },
          "关键输入"
        ),
        a.createElement(
          "span",
          { style: { color: Ve } },
          l.inputs.length ? l.inputs.slice(0, 5).map((c) => `${c.label}=${c.value}`).join("；") : "未提供可展示的输入摘要"
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
          { style: { color: De } },
          "适用条件"
        ),
        a.createElement(
          "span",
          { style: { color: Ve } },
          l.boundaries.slice(0, 2).join("；") || "未声明额外适用条件"
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
            border: `1px solid ${Ma}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Ma,
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
            border: `1px solid ${Ct}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: or,
            color: Ve,
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
            border: `1px solid ${Ct}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: or,
            color: Ve,
            cursor: "pointer"
          }
        },
        "复现计算"
      ) : null
    )
  );
}
function cd({ payload: e }) {
  const t = T().React, n = Mn(e);
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(Et, null, "你最需要知道的"),
      t.createElement(
        "p",
        { style: { margin: 0, color: Ve, fontSize: 13, lineHeight: 1.7 } },
        `本次使用 ${n.title}，读取 ${n.inputs.length} 项输入，记录 ${n.stepCount} 个推导步骤`,
        n.passedGateCount ? `，并通过 ${n.passedGateCount} 项计算校验。` : "。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(Et, null, "边界与提醒"),
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
          (r, i) => t.createElement("li", { key: `${i}:${r}` }, r)
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: De, fontSize: 12 } },
        "未声明额外边界条件。"
      )
    )
  );
}
function dd({ payload: e }) {
  var s, o, d;
  const t = T().React, n = Mn(e), r = (e == null ? void 0 : e.provenance) || {}, i = Object.entries(((s = r == null ? void 0 : r.unit_audit) == null ? void 0 : s.per_symbol) || {}), a = Object.entries((r == null ? void 0 : r.parameter_sources) || {}), l = (c, u, m = c) => t.createElement(
    "div",
    {
      key: m,
      style: {
        display: "grid",
        gridTemplateColumns: "90px minmax(0, 1fr)",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${Ct}`,
        fontSize: 12
      }
    },
    t.createElement("span", { style: { color: De } }, c),
    t.createElement(
      "span",
      { style: { color: Ve, overflowWrap: "anywhere" } },
      u || "—"
    )
  );
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(Et, null, "公式身份"),
      l("公式来源", r.reference || n.title),
      l(
        "公式版本",
        `${r.formula_id || ((o = e == null ? void 0 : e.trace) == null ? void 0 : o.formula_id) || "—"} · ${r.formula_version || ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.formula_version) || "—"}`
      ),
      l(
        "信任类型",
        r.source === "freeform" ? "AI 自由推导" : "UGSci 审定公式"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        Et,
        null,
        `参数来源（${a.length}）`
      ),
      a.length ? t.createElement(
        "div",
        { style: { display: "grid" } },
        ...a.map(
          ([c, u]) => l(
            en(c),
            `${(u == null ? void 0 : u.source) === "user_input" ? "用户输入" : "推导生成"} · ${kn(u == null ? void 0 : u.value, c)}${u != null && u.unit ? ` ${u.unit}` : ""}`,
            c
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
        Et,
        null,
        `单位审计（${n.unitCheckCount} 项）`
      ),
      t.createElement(
        "div",
        {
          style: {
            color: n.unitAuditOk === !1 ? Vi : n.unitAuditOk === !0 ? qi : De,
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
          { style: { cursor: "pointer", color: De, fontSize: 12 } },
          "查看逐项单位检查"
        ),
        t.createElement(
          "div",
          { style: { marginTop: 6 } },
          ...i.map(
            ([c, u]) => l(
              en(c),
              `${u != null && u.ok ? "✓" : "✗"} ${(u == null ? void 0 : u.actual) || "无量纲"} → ${(u == null ? void 0 : u.expected) || "—"}`,
              `unit:${c}`
            )
          )
        )
      ) : null
    ),
    Array.isArray(r.gate) && r.gate.length ? t.createElement(
      "section",
      null,
      t.createElement(Et, null, "通过的计算校验"),
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
          (c, u) => t.createElement(
            "li",
            { key: `${u}:${c}` },
            String(c)
          )
        )
      )
    ) : null,
    r.replay_token ? t.createElement(
      "section",
      null,
      t.createElement(Et, null, "复现身份"),
      t.createElement(
        "code",
        {
          style: {
            display: "block",
            padding: 10,
            borderRadius: 8,
            background: sr,
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
function ud({ payload: e }) {
  const t = T().React, n = Mn(e), [r, i] = t.useState(!1), a = e == null ? void 0 : e.replay, l = [
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
      ...l.map(
        ([s, o]) => t.createElement(
          "div",
          {
            key: String(o),
            style: { padding: 10, borderRadius: 8, background: sr }
          },
          t.createElement(
            "strong",
            { style: { display: "block", color: Ve } },
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
        onClick: () => i(!r),
        "aria-expanded": r,
        style: {
          justifySelf: "start",
          border: `1px solid ${Ct}`,
          borderRadius: 7,
          padding: "6px 10px",
          background: or,
          color: Ve,
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
          background: sr,
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
const md = 128;
let cr = [], Ki = "";
const dr = /* @__PURE__ */ new Set(), Xi = () => dr.forEach((e) => e()), Yi = (e) => (dr.add(e), () => dr.delete(e)), Ba = () => cr;
function Cr(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function pd(e) {
  if (!e || typeof e != "object" || !e.replay_id || !e.status || !Cr(e.result))
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
function Tr(e, t) {
  var i, a, l, s, o;
  if (!Cr(e)) return null;
  const n = (i = e.replay) != null && i.replayId ? `replay:${e.replay.replayId}` : `${((a = e.trace) == null ? void 0 : a.formula_id) || "derivation"}:${((l = e.provenance) == null ? void 0 : l.input_fingerprint) || e.operation || crypto.randomUUID()}`, r = {
    uiId: n,
    sessionId: t || ((o = (s = T()).getCurrentSessionId) == null ? void 0 : o.call(s)) || "",
    payload: e,
    updatedAt: Date.now()
  };
  return cr = [r, ...cr.filter((d) => d.uiId !== n)].slice(
    0,
    md
  ), Xi(), r;
}
function Ir(e) {
  Ki = e, Xi();
}
function fd() {
  return T().React.useSyncExternalStore(
    Yi,
    () => Ki,
    () => ""
  );
}
function Qi(e) {
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
    const i = pd(r);
    if (i) {
      t.push(i);
      return;
    }
    Cr(r) && t.push(r), Object.values(r).forEach(n);
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
function gd(e, t) {
  Qi(e).forEach(
    (n) => Tr(n, t)
  );
}
function yd(e) {
  const t = T().React, n = t.useSyncExternalStore(Yi, Ba, Ba);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
const hd = [], It = /* @__PURE__ */ new Map();
function Ed(e) {
  It.set(e, (It.get(e) || 0) + 1);
}
function bd(e) {
  const t = (It.get(e) || 1) - 1;
  t > 0 ? It.set(e, t) : It.delete(e);
}
function vd(e) {
  return (It.get(e) || 0) > 0;
}
function ja(e) {
  const t = [], n = (r) => {
    t.push(r);
    for (const i of r.children || []) n(i);
  };
  return n(e), t;
}
function wd(e) {
  var d, c;
  const t = ja(e), n = String(
    ((c = (d = t.find(
      (u) => {
        var m;
        return u.kind === "Heading" && Number((m = u.props) == null ? void 0 : m.level) === 2;
      }
    )) == null ? void 0 : d.props) == null ? void 0 : c.value) || "公式计算"
  ), r = t.some(
    (u) => {
      var m;
      return u.kind === "Alert" && String(((m = u.props) == null ? void 0 : m.severity) || "") === "warning";
    }
  ), i = t.filter((u) => u.kind === "MetricCard").map((u) => {
    var m, p;
    return {
      label: String(((m = u.props) == null ? void 0 : m.title) || "结果"),
      value: String(((p = u.props) == null ? void 0 : p.value) ?? "—")
    };
  }), a = t.filter((u) => u.kind === "TableRow").map(
    (u) => (u.children || []).filter((m) => m.kind === "TableCell").map((m) => {
      var p;
      return String(((p = m.props) == null ? void 0 : p.value) ?? "");
    })
  ).filter((u) => u.length >= 4 && u[3] === "derived").map((u) => ({
    label: u[0] || "结果",
    value: [u[1], u[2]].filter(Boolean).join(" ")
  })).reverse(), l = t.filter((u) => u.kind === "NumberInput" || u.kind === "Slider").slice(0, 5).map(
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
  ).flatMap((u) => ja(u)).filter((u) => u.kind === "ListItem").map((u) => {
    var m;
    return String(((m = u.props) == null ? void 0 : m.value) || "");
  }).filter(Boolean).slice(0, 3), o = [...a, ...i].filter(
    (u, m, p) => p.findIndex(
      (w) => w.label === u.label && w.value === u.value
    ) === m
  );
  return { title: n, warning: r, inputs: l, conditions: s, results: o };
}
function Sd({ data: e }) {
  var g, y;
  const t = (g = window.QwenPaw) == null ? void 0 : g.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = nc(), i = n.useRef(/* @__PURE__ */ new Map()), a = ((y = t.getCurrentSessionId) == null ? void 0 : y.call(t)) || "__current_chat__", l = Array.isArray(e.output) ? e.output : hd, s = n.useMemo(
    () => Pi(l),
    [l]
  ), o = n.useMemo(
    () => Qi(l),
    [l]
  );
  n.useEffect(() => {
    for (const f of s) {
      if (!f.ui_id || !f.tree) continue;
      const v = r.getSnapshot(a, f.ui_id);
      v && v.revision >= (f.revision || 1) || r.setSnapshot({
        schemaVersion: "1",
        uiId: f.ui_id,
        revision: f.revision || 1,
        tree: f.tree,
        sessionId: a,
        sourceToolCallId: f.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [s, a]);
  const d = n.useMemo(
    () => s.filter((f) => f.kind === "genui" && !!f.ui_id).map((f) => f.ui_id),
    [s]
  ), c = d.join("\0");
  n.useEffect(() => {
    for (const f of d) Ed(f);
    return () => {
      for (const f of d) bd(f);
    };
  }, [c]);
  const u = n.useMemo(
    () => s.map((f) => f.ui_id).filter((f) => !!f),
    [s]
  ), p = rc(a, u).filter(
    (f) => (
      // Only include snapshots whose ui_id appears in this response's results
      s.some(
        (v) => v.ui_id === f.uiId && (v.kind === "genui" || v.kind === "genui_patch" && !vd(f.uiId))
      )
    )
  ).sort((f, v) => f.updatedAt - v.updatedAt);
  if (o.length > 0)
    return n.createElement(
      "div",
      {
        className: "qwenpaw-genui-inline qwenpaw-derivation-inline",
        style: { marginTop: 8, marginBottom: 8, display: "grid", gap: 8 }
      },
      ...o.map(
        (f, v) => {
          var S, b;
          return n.createElement(
            "div",
            {
              key: String(
                ((S = f.provenance) == null ? void 0 : S.replay_token) || ((b = f.trace) == null ? void 0 : b.formula_id) || v
              ),
              style: {
                border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                borderRadius: 12,
                padding: 12,
                background: "var(--ant-color-bg-container, #fff)"
              }
            },
            n.createElement(kr, {
              payload: f,
              compact: !0,
              onOpenDerivation: () => {
                const x = Tr(f, a);
                x != null && x.uiId && Ir(x.uiId), window.dispatchEvent(
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
      key: zt(f.sessionId, f.uiId),
      className: "qwenpaw-genui-tree",
      "data-genui-id": f.uiId,
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        background: "var(--ant-color-bg-container, #fff)"
      },
      ref: (v) => {
        v && (v.__genuiId = f.uiId);
      }
    },
    n.createElement(
      "div",
      { className: "qwenpaw-genui-export-target" },
      n.createElement(Ic, {
        node: f.tree.root,
        onValuesChange: (v) => i.current.set(f.uiId, v),
        children: n.createElement(Lc, {
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
          onClick: (v) => {
            var b;
            const S = (b = v.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : b.querySelector(
              ".qwenpaw-genui-export-target"
            );
            S && Jc(S, f.uiId).catch(
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
          onClick: (v) => {
            var b;
            const S = (b = v.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : b.querySelector(
              ".qwenpaw-genui-export-target"
            );
            S && Qc(
              S,
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
          onClick: (v) => {
            var b;
            const S = (b = v.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : b.querySelector(
              ".qwenpaw-genui-export-target"
            );
            S && Yc(
              S,
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
      if (!f.uiId.startsWith("ui_trc_")) return w(f);
      const v = wd(f.tree.root), S = v.results[0] || {
        label: "计算结果",
        value: "已完成"
      };
      return n.createElement(
        "div",
        {
          key: zt(f.sessionId, f.uiId),
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
              v.title
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
              S.value
            ),
            n.createElement(
              "span",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12
                }
              },
              S.label
            )
          ),
          n.createElement(
            "span",
            {
              style: {
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 12,
                color: v.warning ? "var(--ant-color-warning, #faad14)" : "var(--ant-color-success, #52c41a)",
                background: v.warning ? "var(--ant-color-warning-bg, #fffbe6)" : "var(--ant-color-success-bg, #f6ffed)"
              }
            },
            v.warning ? "需要人工复核" : "✓ 公式与单位已核验"
          )
        ),
        v.results.length > 1 ? n.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8
            }
          },
          ...v.results.slice(1, 4).map(
            (b) => n.createElement(
              "div",
              {
                key: `${b.label}:${b.value}`,
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
                b.label
              ),
              n.createElement("strong", null, b.value)
            )
          )
        ) : null,
        v.inputs.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `关键输入：${v.inputs.join("；")}`
        ) : null,
        v.conditions.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `适用条件：${v.conditions.join("；")}`
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
function xd({ payload: e }) {
  var s, o;
  const t = T().React, n = ((s = e == null ? void 0 : e.trace) == null ? void 0 : s.variables) || [], r = ((o = e == null ? void 0 : e.trace) == null ? void 0 : o.steps) || [], i = [
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
  ], a = new Map(i.map((d) => [d.id, d])), l = [];
  for (const d of r) {
    for (const c of d.reads || [])
      a.has(c) && l.push({ from: c, to: d.id });
    d.writes && a.has(d.writes) && l.push({ from: d.id, to: d.writes });
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
    ...l.map((d, c) => {
      const u = a.get(d.from), m = a.get(d.to);
      return t.createElement("line", {
        key: `e${c}`,
        x1: u.x + 155,
        y1: u.y + 16,
        x2: m.x,
        y2: m.y + 16,
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
function _d({
  payload: e,
  compact: t = !1
}) {
  var d;
  const n = T().React, [r, i] = n.useState(!t), a = ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.steps) || [], l = a.filter(
    (c) => c.kind !== "bind" || c.note !== "input"
  ), o = (r ? a : l).map(
    (c, u) => n.createElement(
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
    ...o,
    t && a.length !== l.length ? n.createElement(
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
const hn = "var(--ant-color-text, rgba(0,0,0,.88))", Vn = "var(--ant-color-text-secondary, rgba(0,0,0,.45))", Ua = "var(--ant-color-border, #d9d9d9)", Jn = "var(--ant-color-bg-container, #fff)", Na = "var(--ant-color-primary, #1677ff)";
function kd() {
  var y, f, v;
  const e = T().React, t = ((f = (y = T()).getCurrentSessionId) == null ? void 0 : f.call(y)) || "", n = yd(t), r = fd(), [i, a] = e.useState(n[0]), [l, s] = e.useState("summary"), [o, d] = e.useState("steps");
  if (e.useEffect(() => {
    const S = n.find((b) => b.uiId === r);
    S && S !== i ? a(S) : n.some((b) => b.uiId === (i == null ? void 0 : i.uiId)) || a(n[0]);
  }, [n, r, i]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20, color: Vn } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const c = (i == null ? void 0 : i.payload) || n[0].payload, u = c.provenance || {}, m = c.replay, p = () => {
    var b, x, R;
    const S = u.replay_token;
    S && ((R = (x = (b = window.QwenPaw) == null ? void 0 : b.chat) == null ? void 0 : x.sendMessage) == null || R.call(
      x,
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：
${S}`
    ));
  }, w = [
    ["summary", "摘要"],
    ["derivation", "推导"],
    ["evidence", "证据"],
    ["logs", "日志"]
  ], g = (S) => ({
    flex: "1 1 64px",
    minWidth: 0,
    border: "none",
    borderRadius: 7,
    padding: "6px 8px",
    background: S ? Jn : "transparent",
    color: S ? hn : Vn,
    boxShadow: S ? "0 1px 4px rgba(0,0,0,.08)" : "none",
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
          { style: { display: "block", color: hn } },
          "计算详情"
        ),
        e.createElement(
          "span",
          { style: { color: Vn, fontSize: 11 } },
          ((v = c.trace) == null ? void 0 : v.formula_name) || c.operation || "UGSci 推导"
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
        ([S, b]) => e.createElement(
          "button",
          {
            key: S,
            type: "button",
            role: "tab",
            onClick: () => s(S),
            "aria-selected": l === S,
            style: g(l === S)
          },
          b
        )
      )
    ),
    n.length > 1 ? e.createElement(
      "select",
      {
        "aria-label": "选择计算记录",
        value: (i == null ? void 0 : i.uiId) || n[0].uiId,
        onChange: (S) => {
          Ir(S.target.value), a(
            n.find((b) => b.uiId === S.target.value)
          );
        },
        style: {
          width: "100%",
          padding: "7px 9px",
          border: `1px solid ${Ua}`,
          borderRadius: 7,
          color: hn,
          background: Jn
        }
      },
      ...n.map(
        (S) => {
          var b;
          return e.createElement(
            "option",
            { key: S.uiId, value: S.uiId },
            ((b = S.payload.trace) == null ? void 0 : b.formula_name) || S.uiId.slice(0, 18)
          );
        }
      )
    ) : null,
    l === "summary" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 18 } },
      e.createElement(kr, {
        payload: c,
        onOpenDerivation: () => s("derivation"),
        onOpenEvidence: () => s("evidence"),
        onReplay: u.replay_token ? p : void 0
      }),
      e.createElement(cd, { payload: c })
    ) : l === "derivation" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 10 } },
      e.createElement(
        "div",
        { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
        ...[
          ["steps", "关键步骤"],
          ["flow", "流程图"]
        ].map(
          ([S, b]) => e.createElement(
            "button",
            {
              key: S,
              type: "button",
              onClick: () => d(S),
              "aria-pressed": o === S,
              style: {
                border: `1px solid ${o === S ? Na : Ua}`,
                borderRadius: 7,
                padding: "5px 9px",
                background: Jn,
                color: o === S ? Na : hn,
                cursor: "pointer"
              }
            },
            b
          )
        )
      ),
      o === "flow" ? e.createElement(xd, { payload: c }) : e.createElement(_d, { payload: c, compact: !0 })
    ) : l === "evidence" ? e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(dd, { payload: c })
    ) : e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(ud, { payload: c })
    )
  );
}
function Gt(e) {
  var t;
  if (typeof e == "string")
    try {
      return Gt(JSON.parse(e));
    } catch {
      return null;
    }
  return Array.isArray(e) ? Gt((t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text) : e != null && e.status && (e != null && e.result) ? {
    ...e.result,
    replay: {
      replayId: String(e.replay_id || ""),
      status: String(e.status),
      reproducible: e.reproducible === !0,
      elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
      diff: e.diff && typeof e.diff == "object" ? e.diff : {}
    }
  } : (e == null ? void 0 : e.output) !== void 0 ? Gt(e.output) : (e == null ? void 0 : e.content) !== void 0 ? Gt(e.content) : e;
}
function Cd(e) {
  var o, d, c, u, m, p, w;
  const t = T().React, n = ((o = e == null ? void 0 : e.data) == null ? void 0 : o.content) || [], r = ((c = (d = n[1]) == null ? void 0 : d.data) == null ? void 0 : c.output) ?? ((m = (u = n[1]) == null ? void 0 : u.data) == null ? void 0 : m.content) ?? ((w = (p = n[0]) == null ? void 0 : p.data) == null ? void 0 : w.output), i = Gt(r), [a, l] = t.useState(null);
  t.useEffect(() => {
    i && l(Tr(i));
  }, [r]);
  const s = () => {
    a != null && a.uiId && Ir(a.uiId), window.dispatchEvent(
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
    i ? t.createElement(kr, {
      payload: i,
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
let ht = null;
function Td(e, t) {
  var i, a, l, s;
  const n = "ugsci";
  ht == null || ht();
  const r = [];
  if (ce("/ugsci/genui/config", {
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
  }), (i = e.chat) != null && i.toolRender) {
    r.push(
      e.chat.toolRender(n, "emit_ui_tree", xa)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", xa)
    ), r.push(
      e.chat.toolRender(n, "list_ui_components", _a)
    ), r.push(
      e.chat.toolRender(n, "get_genui_guide", _a)
    );
    for (const o of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview"
    ])
      r.push(e.chat.toolRender(n, o, Cd));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (a = e.slot) != null && a.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(kd)
    )
  ), (s = (l = e.chat) == null ? void 0 : l.response) != null && s.append && (r.push(
    e.chat.response.append(
      n,
      (o) => {
        const d = () => (t.useEffect(
          () => gd(o.data.output),
          [o.data.output]
        ), null);
        return t.createElement(
          tc,
          null,
          t.createElement(d),
          t.createElement(Sd, { data: o.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), ht = () => {
    var o;
    for (const d of r.reverse()) (o = d == null ? void 0 : d.dispose) == null || o.call(d);
    if (ic(), vc(), e.genui) {
      const d = { ...e.genui };
      delete d.dispose, delete d.clearSession, e.genui = d;
    }
    ht = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: ht,
    clearSession: ac
  }, ht;
}
const Da = {
  enabled: !0,
  persisted_enabled: !0,
  overridden: !1,
  channels: ["response.append"],
  allow_html: !1,
  allow_actions: [],
  backend_unavailable: !0
};
function Kn(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function Id() {
  const e = T().React, { Alert: t, Card: n, Space: r, Spin: i, Switch: a, Typography: l, message: s } = T().antd, { useEffect: o, useState: d } = e, [c, u] = d(null), [m, p] = d(!1);
  o(() => {
    let g = !0, y = null;
    const f = (v = !1) => {
      ce("/ugsci/genui/config").then((S) => {
        g && (u(S), Kn(S));
      }).catch((S) => {
        g && (u(Da), Kn(Da), v && s.error(String(S)), y = setTimeout(() => f(!1), 3e4));
      });
    };
    return f(!0), () => {
      g = !1, y && clearTimeout(y);
    };
  }, []);
  const w = async (g) => {
    p(!0);
    try {
      const y = await ce("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: g })
      });
      u(y), Kn(y), s.success(
        y.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : g ? "GenUI 已开启" : "GenUI 已关闭"
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
      l.Title,
      { level: 3, id: "ugsci-genui-title" },
      "GenUI"
    ),
    e.createElement(
      l.Paragraph,
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
              l.Text,
              { strong: !0 },
              "启用 GenUI"
            ),
            e.createElement(
              l.Paragraph,
              { type: "secondary", style: { margin: "4px 0 0" } },
              "允许 Agent 生成卡片、表格、图表、表单，并在对话中交互和增量更新。"
            )
          ),
          e.createElement(a, {
            "aria-label": "启用 GenUI",
            checked: c.persisted_enabled,
            loading: m,
            disabled: c.backend_unavailable,
            onChange: w
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
function $d() {
  const { React: e, antd: t } = T();
  return e.createElement(
    "div",
    { style: { width: "100%" } },
    e.createElement(t.Typography.Title, { level: 2 }, "UGSci 设置"),
    e.createElement(
      t.Typography.Paragraph,
      { type: "secondary", style: { marginBottom: 28 } },
      "集中管理 UGSci 的功能与偏好设置。"
    ),
    e.createElement(Id)
  );
}
function zd() {
  const { React: e } = T();
  return e.useEffect(() => {
    window.history.replaceState({}, "", "/settings/ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, []), null;
}
let Ut = null;
function Zi() {
  return Ut || (Ut = (async () => {
    var r;
    const e = (r = window.QwenPaw) == null ? void 0 : r.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = `${e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    )}?v=0.3.6`;
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((i, a) => {
      const l = document.createElement("script");
      l.dataset.plugin = "ugsci", l.src = t, l.onload = () => i(), l.onerror = () => a(new Error("Viewer runtime failed to load")), document.head.appendChild(l);
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
    throw Ut = null, e;
  }), Ut);
}
function Ad() {
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
function Fa(e, t) {
  var i;
  const n = ((i = e.getApiToken) == null ? void 0 : i.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function Ga(e, t, n) {
  if (typeof e.fetch == "function") return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
async function Pd(e, t) {
  var i;
  const n = await Ga(e, "/ugsci/visualization/imports/workspace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...Fa(e, t)
    },
    body: JSON.stringify({
      path: t.path,
      root: t.root,
      name: t.name.replace(/\.[^.]+$/, "")
    })
  });
  if (!n.ok) throw new Error(`导入失败: HTTP ${n.status}`);
  const r = await n.json();
  for (let a = 0; a < 240; a += 1) {
    const l = await Ga(
      e,
      `/ugsci/visualization/imports/${r.job_id}`,
      { headers: Fa(e, t) }
    );
    if (!l.ok) throw new Error(`状态查询失败: HTTP ${l.status}`);
    const s = await l.json();
    if (s.status === "completed") {
      if (!((i = s.result) != null && i.id)) throw new Error("导入完成但未返回数据集 ID");
      return s.result.id;
    }
    if (s.status === "failed" || s.status === "cancelled")
      throw new Error(s.error || "导入任务未完成");
    await new Promise((o) => setTimeout(o, 750));
  }
  throw new Error("导入超时，请稍后重试");
}
async function Rd(e, t) {
  var r;
  let n;
  for (let i = 0; i < 20; i += 1)
    try {
      await ((r = e.executeCommand) == null ? void 0 : r.call(e, "open", { datasetId: t }));
      return;
    } catch (a) {
      n = a, await new Promise((l) => setTimeout(l, 250));
    }
  if (n) throw n;
}
function Od() {
  const e = T().React, { useEffect: t, useRef: n, useState: r } = e, { Spin: i, Alert: a, Button: l, Typography: s, message: o } = T().antd, { Text: d } = s, c = n(null), u = n(null), [m, p] = r(!0), [w, g] = r(null), [y, f] = r("正在加载三维可视化引擎...");
  return t(() => {
    let v = !1;
    async function S() {
      if (c.current)
        try {
          p(!0), g(null);
          const b = await Zi();
          if (v) return;
          const x = T(), J = {
            apiBase: x.getApiUrl("ugsci/visualization"),
            authToken: x.getApiToken() || void 0
          };
          u.current = b.mount(c.current, J);
          const P = Ad();
          if (P) {
            f(`正在导入 ${P.name}...`);
            const j = await Pd(x, P);
            if (v || !u.current || (f("正在打开三维网格..."), await Rd(u.current, j), v)) return;
          }
          v || p(!1);
        } catch (b) {
          if (!v) {
            const x = b instanceof Error ? b.message : "Failed to load viewer";
            g(x), p(!1), o.error(`可视化引擎加载失败: ${x}`);
          }
        }
    }
    return S(), () => {
      if (v = !0, u.current) {
        try {
          u.current.dispose();
        } catch (b) {
          console.warn("[oilgas-vis] Dispose error:", b);
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
    e.createElement(a, {
      type: "error",
      message: "可视化引擎加载失败",
      description: w,
      showIcon: !0,
      style: { maxWidth: 600 }
    }),
    e.createElement(
      l,
      {
        type: "primary",
        onClick: () => window.location.reload()
      },
      "重试"
    ),
    e.createElement(
      d,
      { type: "secondary" },
      "如果持续失败，请检查网络连接或联系管理员。"
    )
  ) : e.createElement(
    "div",
    {
      style: { width: "100%", height: "100%", position: "relative" }
    },
    e.createElement("div", {
      ref: c,
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
      e.createElement(i, { size: "large" }),
      e.createElement(
        "div",
        { style: { marginTop: 16, color: "#8b949e" } },
        y
      )
    )
  );
}
function el(e, t) {
  var i;
  const n = ((i = e.getApiToken) == null ? void 0 : i.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function tl(e, t, n) {
  if (typeof e.fetch == "function")
    return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
function Wa(e) {
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
function Md({ jobId: e, file: t }) {
  const n = T().React, { useEffect: r, useRef: i, useState: a } = n, l = T(), s = i(null), o = i(null), [d, c] = a("queued"), [u, m] = a(0), [p, w] = a(null), [g, y] = a(null);
  return r(() => {
    let f = !1;
    return (async () => {
      var b;
      const S = `/ugsci/visualization/imports/${e}`;
      for (let x = 0; x < 240 && !f; x += 1) {
        try {
          const R = await tl(l, S, {
            headers: { ...el(l, t) }
          });
          if (!R.ok) throw new Error(`状态查询失败: HTTP ${R.status}`);
          const J = await R.json();
          if (f) return;
          if (m(Number(J.progress || 0)), c(J.status), J.status === "completed") {
            if (!((b = J.result) != null && b.id)) throw new Error("导入完成但未返回数据集 ID");
            y(J.result.id);
            return;
          }
          if (J.status === "failed" || J.status === "cancelled") {
            w(J.error || Wa(J.status));
            return;
          }
        } catch (R) {
          if (x >= 239 && !f) {
            c("failed"), w(R instanceof Error ? R.message : String(R));
            return;
          }
        }
        await new Promise((R) => setTimeout(R, 750));
      }
    })(), () => {
      f = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), r(() => {
    if (d !== "completed" || !g || !s.current) return;
    let f = !1;
    return (async () => {
      var v, S;
      try {
        const b = await Zi();
        if (f || !s.current) return;
        o.current = b.mount(s.current, {
          apiBase: l.getApiUrl("ugsci/visualization"),
          authToken: l.getApiToken() || void 0
        });
        let x;
        for (let R = 0; R < 20 && !f; R += 1)
          try {
            await ((S = (v = o.current).executeCommand) == null ? void 0 : S.call(v, "open", { datasetId: g })), x = void 0;
            break;
          } catch (J) {
            x = J;
            const P = J instanceof Error ? J.message : String(J);
            if (!P.includes("数据集不存在") && !P.includes("dataset"))
              throw J;
            await new Promise((j) => setTimeout(j, 250));
          }
        if (x && !f) throw x;
      } catch (b) {
        f || (c("failed"), w(b instanceof Error ? b.message : String(b)));
      }
    })(), () => {
      var v;
      f = !0;
      try {
        (v = o.current) == null || v.dispose();
      } catch {
      }
      o.current = null;
    };
  }, [d, g]), n.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    d === "completed" ? n.createElement("div", {
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
      `${Wa(d)}${u > 0 ? `（${Math.round(u * 100)}%）` : ""}`
    ),
    p ? n.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${p}`
    ) : null
  );
}
function Ld(e) {
  const t = T().React, { useEffect: n, useState: r } = t, { Button: i, Spin: a, Alert: l, Typography: s } = T().antd, { Text: o } = s, d = e.artifact || e.file || {}, c = d.filename || d.title || e.filename || "unknown", u = d.workspacePath || d.path || e.workspacePath, [m, p] = r("idle"), [w, g] = r(null), [y, f] = r(null);
  return n(() => {
    if (!u) return;
    let v = !1;
    return p("submitting"), g(null), f(null), (async () => {
      try {
        const S = T(), b = await tl(S, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...el(S, d)
          },
          body: JSON.stringify({
            path: u,
            root: d.workspaceRoot || "project",
            name: c.replace(/\.[^.]+$/, "")
          })
        });
        if (!b.ok) throw new Error(`Import failed: HTTP ${b.status}`);
        const x = await b.json();
        v || (g(x.job_id), p("submitted"));
      } catch (S) {
        v || (f(S instanceof Error ? S.message : String(S)), p("failed"));
      }
    })(), () => {
      v = !0;
    };
  }, [u, c, d.workspaceRoot, d.agentId, d.chatId, d.projectDirOverride]), m === "submitting" ? t.createElement(
    "div",
    { style: { padding: 24, textAlign: "center" } },
    t.createElement(a, { size: "large" }),
    t.createElement(
      "div",
      { style: { marginTop: 8, color: "#8b949e" } },
      "正在提交工作区文件，浏览器不会复制大型文件..."
    )
  ) : m === "failed" ? t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(l, {
      type: "warning",
      message: "导入失败",
      description: y,
      showIcon: !0
    }),
    t.createElement(i, {
      type: "primary",
      onClick: () => window.location.reload(),
      style: { marginTop: 12 }
    }, "重试")
  ) : t.createElement(
    "div",
    { style: { padding: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" } },
    t.createElement(o, { strong: !0 }, `文件: ${c}`),
    d.size ? t.createElement(o, { type: "secondary" }, `大小: ${(d.size / 1024 / 1024).toFixed(1)} MB`) : null,
    w ? t.createElement(Md, { jobId: w, file: d }) : t.createElement(o, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(i, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function Bd(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0;
  const i = T().antdIcons || {}, a = i.GlobalOutlined || i.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: Od
  }), e.menu.add("ugsci", {
    id: "ugsci.visualization",
    location: "primary.agentScoped",
    label: () => "油气可视化",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.visualization",
    order: 7,
    visible: () => !0
  });
  const l = e.workspace;
  if (l != null && l.registerRenderer)
    try {
      l.registerRenderer({
        id: "ugsci.visualization",
        name: "UGSci 油气可视化",
        component: Ld,
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
const Nt = "/ugsci/storage-dynamics", Ha = (e) => e === "injection" ? "注气" : "采气", je = (e) => e == null ? "缺测" : e.toLocaleString("zh-CN", { maximumFractionDigits: 2 }), jd = {
  xls_row_limit: "疑似 XLS 导出截断",
  invalid_range: "数值超出合法范围",
  invalid_number: "无法识别数值",
  invalid_identity: "日期或库井标识无效",
  duplicate_identical: "相同重复已去重",
  duplicate_conflict: "重复冲突已排除"
}, Ud = {
  gas: "日气量",
  hours: "生产小时",
  pressure: "井口油压",
  casing: "套压",
  water: "日产水量",
  vent: "放空量"
};
function Nd({ rows: e }) {
  const t = T().React, n = [...new Set(e.map((o) => o.month))].sort(), r = n.map((o) => {
    const d = e.filter((u) => u.month === o), c = (u) => {
      const m = d.map((p) => p[u]).filter((p) => p != null);
      return m.length ? m.reduce((p, w) => p + w, 0) : null;
    };
    return {
      month: o,
      injection: c("injection"),
      withdrawal: c("withdrawal")
    };
  }), i = Math.max(
    1,
    ...r.flatMap((o) => [o.injection || 0, o.withdrawal || 0])
  ), a = (o) => 65 + o * 635 / Math.max(1, n.length - 1), l = (o) => 245 - o / i * 200, s = (o) => {
    let d = !1;
    return r.map((c, u) => {
      if (c[o] == null)
        return d = !1, "";
      const m = `${d ? "L" : "M"}${a(u)},${l(c[o])}`;
      return d = !0, m;
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
        y1: l(o * i),
        y2: l(o * i),
        stroke: "currentColor",
        opacity: ".12"
      }
    ), /* @__PURE__ */ t.createElement(
      "text",
      {
        x: "57",
        y: l(o * i) + 4,
        textAnchor: "end",
        fill: "currentColor",
        fontSize: "12"
      },
      je(o * i)
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
    r.map((o, d) => /* @__PURE__ */ t.createElement("g", { key: o.month }, d % Math.max(1, Math.ceil(n.length / 8)) === 0 && /* @__PURE__ */ t.createElement(
      "text",
      {
        x: a(d),
        y: "274",
        textAnchor: "middle",
        fill: "currentColor",
        fontSize: "12"
      },
      o.month
    ), /* @__PURE__ */ t.createElement("rect", { x: a(d) - 3, y: "40", width: "6", height: "205", fill: "transparent" }, /* @__PURE__ */ t.createElement("title", null, o.month, " 注气 ", je(o.injection), " / 采气 ", je(o.withdrawal), " ", "万m³"))))
  ));
}
function Dd() {
  const e = T(), t = e.React, {
    Card: n,
    Select: r,
    Input: i,
    Button: a,
    Space: l,
    Alert: s,
    Table: o,
    Tabs: d,
    Statistic: c,
    Spin: u,
    DatePicker: m,
    InputNumber: p,
    Typography: w
  } = e.antd, [g, y] = t.useState([]), [f, v] = t.useState(""), [S, b] = t.useState(""), [x, R] = t.useState(""), [J, P] = t.useState(""), [j, X] = t.useState(""), [q, U] = t.useState(""), [$, A] = t.useState(4), [M, _] = t.useState(30), [O, D] = t.useState(null), [Y, z] = t.useState(null), [C, te] = t.useState(""), [re, F] = t.useState(""), L = t.useRef(!0), le = async (k) => {
    var xe;
    const oe = await ce(`${Nt}/datasets`, {
      bypassCache: !0
    });
    if (!L.current) return;
    const he = oe.datasets.sort(
      (ze, Se) => Se.created_at.localeCompare(ze.created_at)
    );
    y(he), v(k || ((xe = he[0]) == null ? void 0 : xe.id) || "");
  };
  t.useEffect(() => (L.current = !0, le().catch((k) => {
    L.current && F(String(k.message || k));
  }), () => {
    L.current = !1;
  }), []);
  const ie = () => ({
    dataset_id: f,
    facility: x,
    well: J,
    start: j,
    end: q,
    cycle_start_month: $,
    drop_threshold_pct: M
  }), W = async () => {
    F(""), te("读取并审计数据…");
    try {
      const k = await ce(`${Nt}/imports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_path: S })
      });
      for (; L.current; ) {
        await new Promise((he) => setTimeout(he, 1200));
        const oe = await ce(`${Nt}/imports/${k.id}`, {
          bypassCache: !0
        });
        if (oe.status === "failed") throw new Error(oe.error);
        if (oe.status === "completed") {
          await le(oe.dataset.id), D(null), R(""), P("");
          break;
        }
      }
    } catch (k) {
      L.current && F(k.message || String(k));
    } finally {
      L.current && te("");
    }
  }, pe = async () => {
    F(""), te("分析注采动态…");
    const k = ie();
    try {
      const oe = await ce(`${Nt}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(k)
      });
      L.current && (D(oe), z(k));
    } catch (oe) {
      L.current && F(oe.message || String(oe));
    } finally {
      L.current && te("");
    }
  }, ae = async () => {
    if (Y) {
      te("生成报告…"), F("");
      try {
        const k = await ct(`${Nt}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Y)
        });
        if (!k.ok) throw new Error(await k.text());
        const oe = URL.createObjectURL(await k.blob()), he = document.createElement("a");
        he.href = oe, he.download = "储气库生产动态分析报告.md", he.click(), setTimeout(() => URL.revokeObjectURL(oe), 1e3);
      } catch (k) {
        F(k.message || String(k));
      } finally {
        L.current && te("");
      }
    }
  }, G = g.find((k) => k.id === f), ue = (k, oe, he) => /* @__PURE__ */ t.createElement(
    o,
    {
      size: "small",
      dataSource: k,
      columns: oe,
      rowKey: he,
      pagination: { pageSize: 12, showSizeChanger: !0 },
      scroll: { x: "max-content" }
    }
  ), N = (k, oe, he) => ({ title: k, dataIndex: oe, render: he });
  return /* @__PURE__ */ t.createElement("div", { style: { padding: 24, maxWidth: 1600, margin: "0 auto" } }, /* @__PURE__ */ t.createElement(w.Title, { level: 2, style: { marginTop: 0 } }, "储气库生产动态分析"), /* @__PURE__ */ t.createElement(w.Paragraph, { type: "secondary" }, "从注采日记录到库井动态、运行阶段与复核线索。保留计量口径，每个异常可追溯到原表。"), /* @__PURE__ */ t.createElement(n, { title: "数据与分析范围", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(l.Compact, { style: { width: "100%", marginBottom: 16 } }, /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "注采数据路径",
      value: S,
      onChange: (k) => b(k.target.value),
      placeholder: "本地 XLS / XLSX / UTF-8 CSV 文件或目录的绝对路径",
      disabled: !!C
    }
  ), /* @__PURE__ */ t.createElement(a, { onClick: W, disabled: !S.trim() || !!C }, "导入并检查")), /* @__PURE__ */ t.createElement(l, { wrap: !0, style: { marginBottom: 12 } }, /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "数据集",
      style: { minWidth: 260 },
      placeholder: "选择数据集",
      value: f || void 0,
      disabled: !!C,
      onChange: (k) => {
        v(k), R(""), P(""), D(null);
      },
      options: g.map((k) => ({
        label: `${k.name} · ${je(k.records)} 条`,
        value: k.id
      }))
    }
  ), /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "储气库",
      value: x,
      style: { minWidth: 145 },
      disabled: !!C,
      onChange: (k) => {
        R(k), P("");
      },
      options: [
        { label: "全部储气库", value: "" },
        ...((G == null ? void 0 : G.facilities) || []).map((k) => ({
          label: k.facility,
          value: k.facility
        }))
      ]
    }
  ), /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "井号",
      value: J,
      onChange: (k) => P(k.target.value),
      placeholder: "原始井号（可选）",
      style: { width: 150 },
      disabled: !!C
    }
  ), /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "起始日期",
      type: "date",
      value: j,
      onChange: (k) => X(k.target.value),
      disabled: !!C,
      style: { width: 155 }
    }
  ), /* @__PURE__ */ t.createElement("span", null, "至"), /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "截止日期",
      type: "date",
      value: q,
      onChange: (k) => U(k.target.value),
      disabled: !!C,
      style: { width: 155 }
    }
  )), /* @__PURE__ */ t.createElement(l, { wrap: !0 }, /* @__PURE__ */ t.createElement("span", null, "气年度起始月"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "气年度起始月份",
      min: 1,
      max: 12,
      value: $,
      disabled: !!C,
      onChange: (k) => A(k || 4)
    }
  ), /* @__PURE__ */ t.createElement("span", null, "折算量下降筛查阈值（%）"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "下降筛查阈值",
      min: 1,
      max: 100,
      value: M,
      disabled: !!C,
      onChange: (k) => _(k || 30)
    }
  ), /* @__PURE__ */ t.createElement(a, { type: "primary", onClick: pe, disabled: !f || !!C }, "分析动态"), /* @__PURE__ */ t.createElement(a, { onClick: ae, disabled: !O || !!C }, "下载分析报告"))), re && /* @__PURE__ */ t.createElement(
    s,
    {
      type: "error",
      showIcon: !0,
      message: re,
      style: { marginBottom: 16 }
    }
  ), C && /* @__PURE__ */ t.createElement("div", { role: "status", style: { padding: 16 } }, /* @__PURE__ */ t.createElement(u, { size: "small" }), " ", C), !O && !C && /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(w.Paragraph, null, "选择已导入数据集并点击“分析动态”。也可以在专家中心创建“储气库生产动态分析师”，通过对话调用相同的分析工具。"), /* @__PURE__ */ t.createElement(
    s,
    {
      type: "info",
      showIcon: !0,
      message: "源文件只读；空值不补零，井口油压不替代地层压力。"
    }
  )), O && /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(
    s,
    {
      type: "info",
      showIcon: !0,
      message: `分析截至数据日期 ${O.summary.as_of} · ${O.filters.facility || "全部库"} / ${O.filters.well || "全部井"} · ${O.summary.start} 起 · 气年度 ${O.parameters.cycle_start_month} 月起 · 筛查阈值 ${O.parameters.drop_threshold_pct}%`,
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
        `${O.summary.facilities} / ${O.summary.wells}`,
        ""
      ],
      ["已记录累计注气", je(O.summary.injection), "万m³"],
      ["已记录累计采气", je(O.summary.withdrawal), "万m³"],
      ["气量缺测日记录", je(O.summary.missing_gas), "条"],
      ["筛查线索", je(O.summary.anomaly_count), "项"]
    ].map(([k, oe, he]) => /* @__PURE__ */ t.createElement(n, { key: k, size: "small" }, /* @__PURE__ */ t.createElement(c, { title: k, value: oe, suffix: he })))
  ), /* @__PURE__ */ t.createElement(n, { title: "注采月度动态", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(Nd, { rows: O.monthly }), /* @__PURE__ */ t.createElement(w.Text, { type: "secondary" }, "未记录的一侧保持缺测。累计注采差额需要完整历史与期初库存才能参与库存核算。")), /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(
    d,
    {
      items: [
        {
          key: "coverage",
          label: "数据覆盖与质量",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, ue(
            O.coverage,
            [
              N("储气库", "facility"),
              N("方向", "mode", Ha),
              N("起始日期", "start"),
              N("截止日期", "end"),
              N("记录数", "records", je),
              N("气量缺测", "missing_gas", je),
              N("计量量 / 万m³", "observed_volume", je)
            ],
            (k) => `${k.facility}-${k.mode}`
          ), /* @__PURE__ */ t.createElement(
            s,
            {
              type: "warning",
              showIcon: !0,
              message: "分析口径与数据限制",
              description: /* @__PURE__ */ t.createElement("ul", null, O.warnings.map((k, oe) => /* @__PURE__ */ t.createElement("li", { key: oe }, k)))
            }
          ), /* @__PURE__ */ t.createElement(w.Paragraph, { style: { marginTop: 12 } }, "整个数据集导入检查：", Object.entries(O.quality.import_counts).map(([k, oe]) => `${jd[k] || k} ${oe} 项`).join("；") || "未发现已配置检查项中的问题", "。下方最多显示 100 条原表问题样例。"), ue(
            O.quality.examples,
            [
              N("问题", "message"),
              N(
                "字段",
                "field",
                (k) => Ud[k] || k || "—"
              ),
              N("文件", "file"),
              N("表", "sheet"),
              N("原行号", "row")
            ],
            (k) => `${k.file}-${k.sheet}-${k.row}-${k.code}-${k.field}`
          ))
        },
        {
          key: "cycles",
          label: "气年度与阶段",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, ue(
            O.cycles,
            [
              N("储气库", "facility"),
              N("气年度", "gas_year"),
              N("注气 / 万m³", "injection", je),
              N("采气 / 万m³", "withdrawal", je),
              N("净计量变化 / 万m³", "net_metered_change", je),
              N(
                "水气质量比 / t/万m³",
                "water_gas_mass_ratio",
                je
              ),
              N("覆盖状态", "completeness")
            ],
            (k) => `${k.facility}-${k.gas_year}`
          ), /* @__PURE__ */ t.createElement(w.Title, { level: 5 }, "近期运行阶段（按实测记录）"), ue(
            O.phases_recent,
            [
              N("库", "facility"),
              N(
                "状态",
                "state",
                (k) => ({
                  injection: "注气",
                  withdrawal: "采气",
                  mixed: "混合",
                  zero_observed: "已观测零气量",
                  unknown: "气量未知"
                })[k] || k
              ),
              N("起始", "start"),
              N("截止", "end"),
              N("连续观测日", "observed_days")
            ],
            (k) => `${k.facility}-${k.start}`
          ))
        },
        {
          key: "wells",
          label: "井动态与短期基线",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, ue(
            O.wells,
            [
              N("库", "facility"),
              N("井号", "well"),
              N("方向", "mode", Ha),
              N("运行日", "active_days", je),
              N("累计计量 / 万m³", "observed_volume", je),
              N("最近运行日期", "last_active_date"),
              N("折算量变化 / %", "rate_change_pct", je),
              N("井口油压变化 / %", "pressure_change_pct", je),
              N(
                "条件性日量基线 / 万m³",
                "forecast",
                (k) => je(k == null ? void 0 : k.daily_volume)
              ),
              N(
                "滚动回测 MAE / 万m³",
                "forecast",
                (k) => je(k == null ? void 0 : k.backtest_mae)
              ),
              N("基线状态", "forecast_reason")
            ],
            (k) => `${k.facility}-${k.well}-${k.mode}`
          ), /* @__PURE__ */ t.createElement(w.Text, { type: "secondary" }, "短期基线仅限保持工况的 7 日分析；停井、缺测与日期断档会断开阶段。回测仅使用预测时点之前的记录。"))
        },
        {
          key: "anomalies",
          label: "复核线索",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(w.Paragraph, null, "共 ", je(O.summary.anomaly_count), " ", "项筛查线索，显示最近 100 项。线索需要结合现场调度与工程资料复核。"), ue(
            O.anomalies,
            [
              N("日期", "day"),
              N("库", "facility"),
              N("井号", "well"),
              N("线索", "message"),
              N("变化 / %", "rate_change_pct", je),
              N(
                "原表位置",
                "source",
                (k) => `${k.file} / ${k.sheet} / 第 ${k.row} 行`
              )
            ],
            (k) => `${k.facility}-${k.well}-${k.day}-${k.code}`
          ))
        }
      ]
    }
  ))));
}
function Fd() {
  var o, d, c, u;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = T().React, n = "ugsci";
  function r() {
    return T().React.createElement(Ks, { embedded: !0 });
  }
  function i() {
    return T().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (d = (o = e.chat) == null ? void 0 : o.rightHeader) != null && d.add ? (e.chat.rightHeader.add(
    n,
    t.createElement(Ys),
    {
      id: "ugsci.welcome-injector",
      order: -1
      // render before other right-header items (invisible anyway)
    }
  ), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = T().antdIcons || {}, l = a.UserSwitchOutlined, s = a.ToolOutlined;
  e.route.add(n, {
    id: "ugsci.storage-dynamics",
    path: "/ugsci-storage-dynamics",
    component: Dd
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
    component: Ko
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5
  }), e.route.add(n, {
    id: "ugsci.settings",
    path: "/ugsci-settings",
    component: $d
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: zd
  }), e.route.add(n, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: xi
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
    component: ks
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Cs
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: i
  }), (c = e.marketplace) == null || c.add(n, {
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
  Td(e, t), Bd(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, host-managed navigation"
  );
}
function ur() {
  try {
    Fd();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(ur, 500);
  }
}
var Za;
if ((Za = window.QwenPaw) != null && Za.host)
  ur();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), ur());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function Gd(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), i = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(i), t && (r.href = t), i.href = e, i.href;
}
const Wd = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function gt(e) {
  const t = [];
  for (let n = 0, r = e.length; n < r; n++)
    t.push(e[n]);
  return t;
}
let xt = null;
function nl(e = {}) {
  return xt || (e.includeStyleProperties ? (xt = e.includeStyleProperties, xt) : (xt = gt(window.getComputedStyle(document.documentElement)), xt));
}
function Cn(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function Hd(e) {
  const t = Cn(e, "border-left-width"), n = Cn(e, "border-right-width");
  return e.clientWidth + t + n;
}
function qd(e) {
  const t = Cn(e, "border-top-width"), n = Cn(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function rl(e, t = {}) {
  const n = t.width || Hd(e), r = t.height || qd(e);
  return { width: n, height: r };
}
function Vd() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const et = 16384;
function Jd(e) {
  (e.width > et || e.height > et) && (e.width > et && e.height > et ? e.width > e.height ? (e.height *= et / e.width, e.width = et) : (e.width *= et / e.height, e.height = et) : e.width > et ? (e.height *= et / e.width, e.width = et) : (e.width *= et / e.height, e.height = et));
}
function Tn(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function Kd(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function Xd(e, t, n) {
  const r = "http://www.w3.org/2000/svg", i = document.createElementNS(r, "svg"), a = document.createElementNS(r, "foreignObject");
  return i.setAttribute("width", `${t}`), i.setAttribute("height", `${n}`), i.setAttribute("viewBox", `0 0 ${t} ${n}`), a.setAttribute("width", "100%"), a.setAttribute("height", "100%"), a.setAttribute("x", "0"), a.setAttribute("y", "0"), a.setAttribute("externalResourcesRequired", "true"), i.appendChild(a), a.appendChild(e), Kd(i);
}
const Xe = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Xe(n, t);
};
function Yd(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Qd(e, t) {
  return nl(t).map((n) => {
    const r = e.getPropertyValue(n), i = e.getPropertyPriority(n);
    return `${n}: ${r}${i ? " !important" : ""};`;
  }).join(" ");
}
function Zd(e, t, n, r) {
  const i = `.${e}:${t}`, a = n.cssText ? Yd(n) : Qd(n, r);
  return document.createTextNode(`${i}{${a}}`);
}
function qa(e, t, n, r) {
  const i = window.getComputedStyle(e, n), a = i.getPropertyValue("content");
  if (a === "" || a === "none")
    return;
  const l = Wd();
  try {
    t.className = `${t.className} ${l}`;
  } catch {
    return;
  }
  const s = document.createElement("style");
  s.appendChild(Zd(l, n, i, r)), t.appendChild(s);
}
function eu(e, t, n) {
  qa(e, t, ":before", n), qa(e, t, ":after", n);
}
const Va = "application/font-woff", Ja = "image/jpeg", tu = {
  woff: Va,
  woff2: Va,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: Ja,
  jpeg: Ja,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function nu(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function $r(e) {
  const t = nu(e).toLowerCase();
  return tu[t] || "";
}
function ru(e) {
  return e.split(/,/)[1];
}
function mr(e) {
  return e.search(/^(data:)/) !== -1;
}
function au(e, t) {
  return `data:${t};base64,${e}`;
}
async function al(e, t, n) {
  const r = await fetch(e, t);
  if (r.status === 404)
    throw new Error(`Resource "${r.url}" not found`);
  const i = await r.blob();
  return new Promise((a, l) => {
    const s = new FileReader();
    s.onerror = l, s.onloadend = () => {
      try {
        a(n({ res: r, result: s.result }));
      } catch (o) {
        l(o);
      }
    }, s.readAsDataURL(i);
  });
}
const Xn = {};
function iu(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function zr(e, t, n) {
  const r = iu(e, t, n.includeQueryParams);
  if (Xn[r] != null)
    return Xn[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let i;
  try {
    const a = await al(e, n.fetchRequestInit, ({ res: l, result: s }) => (t || (t = l.headers.get("Content-Type") || ""), ru(s)));
    i = au(a, t);
  } catch (a) {
    i = n.imagePlaceholder || "";
    let l = `Failed to fetch resource: ${e}`;
    a && (l = typeof a == "string" ? a : a.message), l && console.warn(l);
  }
  return Xn[r] = i, i;
}
async function lu(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : Tn(t);
}
async function ou(e, t) {
  if (e.currentSrc) {
    const a = document.createElement("canvas"), l = a.getContext("2d");
    a.width = e.clientWidth, a.height = e.clientHeight, l == null || l.drawImage(e, 0, 0, a.width, a.height);
    const s = a.toDataURL();
    return Tn(s);
  }
  const n = e.poster, r = $r(n), i = await zr(n, r, t);
  return Tn(i);
}
async function su(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await Ln(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function cu(e, t) {
  return Xe(e, HTMLCanvasElement) ? lu(e) : Xe(e, HTMLVideoElement) ? ou(e, t) : Xe(e, HTMLIFrameElement) ? su(e, t) : e.cloneNode(il(e));
}
const du = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", il = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function uu(e, t, n) {
  var r, i;
  if (il(t))
    return t;
  let a = [];
  return du(e) && e.assignedNodes ? a = gt(e.assignedNodes()) : Xe(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? a = gt(e.contentDocument.body.childNodes) : a = gt(((i = e.shadowRoot) !== null && i !== void 0 ? i : e).childNodes), a.length === 0 || Xe(e, HTMLVideoElement) || await a.reduce((l, s) => l.then(() => Ln(s, n)).then((o) => {
    o && t.appendChild(o);
  }), Promise.resolve()), t;
}
function mu(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const i = window.getComputedStyle(e);
  i.cssText ? (r.cssText = i.cssText, r.transformOrigin = i.transformOrigin) : nl(n).forEach((a) => {
    let l = i.getPropertyValue(a);
    a === "font-size" && l.endsWith("px") && (l = `${Math.floor(parseFloat(l.substring(0, l.length - 2))) - 0.1}px`), Xe(e, HTMLIFrameElement) && a === "display" && l === "inline" && (l = "block"), a === "d" && t.getAttribute("d") && (l = `path(${t.getAttribute("d")})`), r.setProperty(a, l, i.getPropertyPriority(a));
  });
}
function pu(e, t) {
  Xe(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Xe(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function fu(e, t) {
  if (Xe(e, HTMLSelectElement)) {
    const n = t, r = Array.from(n.children).find((i) => e.value === i.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function gu(e, t, n) {
  return Xe(t, Element) && (mu(e, t, n), eu(e, t, n), pu(e, t), fu(e, t)), t;
}
async function yu(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let a = 0; a < n.length; a++) {
    const s = n[a].getAttribute("xlink:href");
    if (s) {
      const o = e.querySelector(s), d = document.querySelector(s);
      !o && d && !r[s] && (r[s] = await Ln(d, t, !0));
    }
  }
  const i = Object.values(r);
  if (i.length) {
    const a = "http://www.w3.org/1999/xhtml", l = document.createElementNS(a, "svg");
    l.setAttribute("xmlns", a), l.style.position = "absolute", l.style.width = "0", l.style.height = "0", l.style.overflow = "hidden", l.style.display = "none";
    const s = document.createElementNS(a, "defs");
    l.appendChild(s);
    for (let o = 0; o < i.length; o++)
      s.appendChild(i[o]);
    e.appendChild(l);
  }
  return e;
}
async function Ln(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => cu(r, t)).then((r) => uu(e, r, t)).then((r) => gu(e, r, t)).then((r) => yu(r, t));
}
const ll = /url\((['"]?)([^'"]+?)\1\)/g, hu = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Eu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function bu(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function vu(e) {
  const t = [];
  return e.replace(ll, (n, r, i) => (t.push(i), n)), t.filter((n) => !mr(n));
}
async function wu(e, t, n, r, i) {
  try {
    const a = n ? Gd(t, n) : t, l = $r(t);
    let s;
    return i || (s = await zr(a, l, r)), e.replace(bu(t), `$1${s}$3`);
  } catch {
  }
  return e;
}
function Su(e, { preferredFontFormat: t }) {
  return t ? e.replace(Eu, (n) => {
    for (; ; ) {
      const [r, , i] = hu.exec(n) || [];
      if (!i)
        return "";
      if (i === t)
        return `src: ${r};`;
    }
  }) : e;
}
function ol(e) {
  return e.search(ll) !== -1;
}
async function sl(e, t, n) {
  if (!ol(e))
    return e;
  const r = Su(e, n);
  return vu(r).reduce((a, l) => a.then((s) => wu(s, l, t, n)), Promise.resolve(r));
}
async function _t(e, t, n) {
  var r;
  const i = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (i) {
    const a = await sl(i, null, n);
    return t.style.setProperty(e, a, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function xu(e, t) {
  await _t("background", e, t) || await _t("background-image", e, t), await _t("mask", e, t) || await _t("-webkit-mask", e, t) || await _t("mask-image", e, t) || await _t("-webkit-mask-image", e, t);
}
async function _u(e, t) {
  const n = Xe(e, HTMLImageElement);
  if (!(n && !mr(e.src)) && !(Xe(e, SVGImageElement) && !mr(e.href.baseVal)))
    return;
  const r = n ? e.src : e.href.baseVal, i = await zr(r, $r(r), t);
  await new Promise((a, l) => {
    e.onload = a, e.onerror = t.onImageErrorHandler ? (...o) => {
      try {
        a(t.onImageErrorHandler(...o));
      } catch (d) {
        l(d);
      }
    } : l;
    const s = e;
    s.decode && (s.decode = a), s.loading === "lazy" && (s.loading = "eager"), n ? (e.srcset = "", e.src = i) : e.href.baseVal = i;
  });
}
async function ku(e, t) {
  const r = gt(e.childNodes).map((i) => cl(i, t));
  await Promise.all(r).then(() => e);
}
async function cl(e, t) {
  Xe(e, Element) && (await xu(e, t), await _u(e, t), await ku(e, t));
}
function Cu(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((i) => {
    n[i] = r[i];
  }), e;
}
const Ka = {};
async function Xa(e) {
  let t = Ka[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, Ka[e] = t, t;
}
async function Ya(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, a = (n.match(/url\([^)]+\)/g) || []).map(async (l) => {
    let s = l.replace(r, "$1");
    return s.startsWith("https://") || (s = new URL(s, e.url).href), al(s, t.fetchRequestInit, ({ result: o }) => (n = n.replace(l, `url(${o})`), [l, o]));
  });
  return Promise.all(a).then(() => n);
}
function Qa(e) {
  if (e == null)
    return [];
  const t = [], n = /(\/\*[\s\S]*?\*\/)/gi;
  let r = e.replace(n, "");
  const i = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  for (; ; ) {
    const o = i.exec(r);
    if (o === null)
      break;
    t.push(o[0]);
  }
  r = r.replace(i, "");
  const a = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, l = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", s = new RegExp(l, "gi");
  for (; ; ) {
    let o = a.exec(r);
    if (o === null) {
      if (o = s.exec(r), o === null)
        break;
      a.lastIndex = s.lastIndex;
    } else
      s.lastIndex = a.lastIndex;
    t.push(o[0]);
  }
  return t;
}
async function Tu(e, t) {
  const n = [], r = [];
  return e.forEach((i) => {
    if ("cssRules" in i)
      try {
        gt(i.cssRules || []).forEach((a, l) => {
          if (a.type === CSSRule.IMPORT_RULE) {
            let s = l + 1;
            const o = a.href, d = Xa(o).then((c) => Ya(c, t)).then((c) => Qa(c).forEach((u) => {
              try {
                i.insertRule(u, u.startsWith("@import") ? s += 1 : i.cssRules.length);
              } catch (m) {
                console.error("Error inserting rule from remote css", {
                  rule: u,
                  error: m
                });
              }
            })).catch((c) => {
              console.error("Error loading remote css", c.toString());
            });
            r.push(d);
          }
        });
      } catch (a) {
        const l = e.find((s) => s.href == null) || document.styleSheets[0];
        i.href != null && r.push(Xa(i.href).then((s) => Ya(s, t)).then((s) => Qa(s).forEach((o) => {
          l.insertRule(o, l.cssRules.length);
        })).catch((s) => {
          console.error("Error loading remote stylesheet", s);
        })), console.error("Error inlining remote css file", a);
      }
  }), Promise.all(r).then(() => (e.forEach((i) => {
    if ("cssRules" in i)
      try {
        gt(i.cssRules || []).forEach((a) => {
          n.push(a);
        });
      } catch (a) {
        console.error(`Error while reading CSS rules from ${i.href}`, a);
      }
  }), n));
}
function Iu(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => ol(t.style.getPropertyValue("src")));
}
async function $u(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = gt(e.ownerDocument.styleSheets), r = await Tu(n, t);
  return Iu(r);
}
function dl(e) {
  return e.trim().replace(/["']/g, "");
}
function zu(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((a) => {
      t.add(dl(a));
    }), Array.from(r.children).forEach((a) => {
      a instanceof HTMLElement && n(a);
    });
  }
  return n(e), t;
}
async function Au(e, t) {
  const n = await $u(e, t), r = zu(e);
  return (await Promise.all(n.filter((a) => r.has(dl(a.style.fontFamily))).map((a) => {
    const l = a.parentStyleSheet ? a.parentStyleSheet.href : null;
    return sl(a.cssText, l, t);
  }))).join(`
`);
}
async function Pu(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await Au(e, t);
  if (n) {
    const r = document.createElement("style"), i = document.createTextNode(n);
    r.appendChild(i), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function ul(e, t = {}) {
  const { width: n, height: r } = rl(e, t), i = await Ln(e, t, !0);
  return await Pu(i, t), await cl(i, t), Cu(i, t), await Xd(i, n, r);
}
async function ml(e, t = {}) {
  const { width: n, height: r } = rl(e, t), i = await ul(e, t), a = await Tn(i), l = document.createElement("canvas"), s = l.getContext("2d"), o = t.pixelRatio || Vd(), d = t.canvasWidth || n, c = t.canvasHeight || r;
  return l.width = d * o, l.height = c * o, t.skipAutoScale || Jd(l), l.style.width = `${d}`, l.style.height = `${c}`, t.backgroundColor && (s.fillStyle = t.backgroundColor, s.fillRect(0, 0, l.width, l.height)), s.drawImage(a, 0, 0, l.width, l.height), l;
}
async function Ru(e, t = {}) {
  return (await ml(e, t)).toDataURL();
}
const Ou = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: ml,
  toPng: Ru,
  toSvg: ul
}, Symbol.toStringTag, { value: "Module" }));
