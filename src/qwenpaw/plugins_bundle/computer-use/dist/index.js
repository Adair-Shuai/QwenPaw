const I = {
  en: {
    routeLabel: "Computer Use",
    title: "Computer Use",
    ready: "Runtime ready",
    unavailable: "Runtime unavailable",
    refresh: "Refresh",
    stop: "Stop automation",
    feature: "Enable Computer Use",
    enabledMsg: "Computer Use enabled",
    disabledMsg: "Computer Use disabled; running automation stopped",
    application: "Application",
    applicationId: "Application ID",
    revoke: "Revoke access",
    revokeConfirm: "Revoke this application access?",
    empty: "No applications are always allowed.",
    approvalTitle: "Application access",
    unknownApplication: "Unknown application",
    risk: "Risk",
    deny: "Deny",
    allowSession: "Allow for this session",
    allowAlways: "Always allow",
    failed: "Action failed.",
    accessManagement: "Access management",
    version: "Version",
    decision: {
      deny: "Access denied.",
      session: "Access allowed for this session.",
      always: "Application always allowed."
    }
  },
  zh: {
    routeLabel: "电脑操作",
    title: "电脑操作",
    ready: "运行环境已就绪",
    unavailable: "运行环境不可用",
    refresh: "刷新",
    stop: "停止自动化",
    feature: "启用电脑操作",
    enabledMsg: "已启用电脑操作",
    disabledMsg: "已关闭电脑操作，正在进行的自动化已停止",
    application: "应用",
    applicationId: "应用标识",
    revoke: "撤销授权",
    revokeConfirm: "撤销这个应用的授权？",
    empty: "暂未允许任何应用长期访问。",
    approvalTitle: "应用访问请求",
    unknownApplication: "未知应用",
    risk: "风险",
    deny: "拒绝",
    allowSession: "仅本次会话允许",
    allowAlways: "始终允许",
    failed: "操作失败。",
    accessManagement: "授权管理",
    version: "版本",
    decision: {
      deny: "已拒绝访问。",
      session: "已允许本次会话访问。",
      always: "已始终允许该应用。"
    }
  }
};
function S(t) {
  return t != null && t.toLowerCase().startsWith("zh") ? "zh" : "en";
}
function a(t, n) {
  if (n.startsWith("decision.")) {
    const s = n.slice(
      9
    );
    return I[t].decision[s];
  }
  return I[t][n];
}
const q = "1.0.7", B = {
  version: q
}, o = window.QwenPaw.host, e = o.React;
function D() {
  return e.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": !0,
      focusable: "false",
      width: "1em",
      height: "1em"
    },
    e.createElement("path", {
      d: "M11.3 17.4H4.25q-1.5 0-1.5-1.5V5.1q0-1.5 1.5-1.5h15.5q1.5 0 1.5 1.5v7.25M9.3 17.4v3m-3.2 0h6"
    }),
    e.createElement("path", {
      d: "m14.2 10.9.55 9.5 2.65-2.85 2.8 3.05 1.7-1.55-2.8-3.05 3.0-1.5Z"
    })
  );
}
const {
  Badge: J,
  Button: b,
  Empty: M,
  Popconfirm: F,
  Space: k,
  Switch: Q,
  Table: H,
  Tabs: K,
  Tooltip: R,
  Typography: V,
  message: m
} = o.antd, {
  CheckOutlined: z,
  CloseOutlined: G,
  DeleteOutlined: Z,
  FolderOpenOutlined: X,
  ReloadOutlined: Y,
  SafetyCertificateOutlined: ee
} = o.antdIcons, { Text: d, Title: te } = V;
function ae() {
  try {
    return S(localStorage.getItem("language"));
  } catch {
    return S(void 0);
  }
}
async function h(t, n) {
  const s = o.fetch ? await o.fetch(t, n) : await fetch(o.getApiUrl(t), {
    ...n,
    headers: {
      ...(n == null ? void 0 : n.headers) || {},
      ...o.getApiToken() ? { Authorization: `Bearer ${o.getApiToken()}` } : {}
    }
  }), r = await s.text();
  let l = null;
  try {
    l = r ? JSON.parse(r) : null;
  } catch {
    l = null;
  }
  if (!s.ok) {
    const u = l && typeof l == "object" && "detail" in l ? l.detail : void 0;
    throw new Error(
      typeof u == "string" ? u : `HTTP ${s.status}`
    );
  }
  return l;
}
function ne(t, n) {
  const s = t.toolParams.display_name;
  if (typeof s == "string" && s.trim())
    return s;
  const r = t.toolParams.canonical_app_id;
  return typeof r == "string" && r.trim() ? r : a(n, "unknownApplication");
}
function se(t) {
  const n = t.toolParams.canonical_app_id;
  if (typeof n != "string" || !n.trim())
    return "";
  const s = n.indexOf(":");
  return s !== -1 && n.slice(0, s) === "process" ? n.slice(s + 1) : n;
}
function oe({ approval: t, onResolved: n }) {
  var g;
  const s = S((g = o.useLocale) == null ? void 0 : g.call(o)), [r, l] = e.useState(null), u = typeof t.toolParams.risk == "string" ? t.toolParams.risk : "", v = typeof t.toolParams.warning == "string" ? t.toolParams.warning : "", C = ne(t, s), p = se(t), y = async (f) => {
    l(f);
    try {
      await h("/computer-use/session/pending/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: t.sessionId,
          request_id: t.requestId,
          decision: f
        })
      }), m.success(a(s, `decision.${f}`)), n();
    } catch (E) {
      m.error(
        E instanceof Error ? E.message : a(s, "failed")
      );
    } finally {
      l(null);
    }
  };
  return e.createElement(
    o.antd.Card,
    { size: "small", bordered: !0, style: { borderRadius: 8 } },
    e.createElement(
      "div",
      { style: { display: "grid", gap: 14 } },
      e.createElement(
        "div",
        { style: { display: "grid", gap: 4 } },
        e.createElement(
          k,
          { size: 8 },
          e.createElement(ee),
          e.createElement(
            d,
            { strong: !0 },
            a(s, "approvalTitle")
          )
        ),
        e.createElement(d, { strong: !0 }, C),
        p && p !== C ? e.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              minWidth: 0,
              maxWidth: "100%",
              padding: "2px 8px",
              borderRadius: 6,
              background: "rgba(140, 140, 140, 0.1)"
            }
          },
          e.createElement(X, {
            style: { color: "#8c8c8c", flexShrink: 0, fontSize: 12 }
          }),
          e.createElement(
            d,
            {
              type: "secondary",
              copyable: { text: p },
              ellipsis: { tooltip: p },
              style: {
                fontSize: 12,
                minWidth: 0,
                fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
              }
            },
            p
          )
        ) : null,
        u ? e.createElement(
          d,
          { type: "secondary" },
          `${a(s, "risk")}: ${u}`
        ) : null,
        v ? e.createElement(d, { type: "warning" }, v) : null
      ),
      e.createElement(
        k,
        { size: 8, wrap: !0 },
        e.createElement(
          b,
          {
            danger: !0,
            icon: e.createElement(G),
            loading: r === "deny",
            disabled: r !== null,
            onClick: () => void y("deny")
          },
          a(s, "deny")
        ),
        e.createElement(
          b,
          {
            icon: e.createElement(z),
            loading: r === "session",
            disabled: r !== null,
            onClick: () => void y("session")
          },
          a(s, "allowSession")
        ),
        e.createElement(
          b,
          {
            type: "primary",
            icon: e.createElement(z),
            loading: r === "always",
            disabled: r !== null,
            onClick: () => void y("always")
          },
          a(s, "allowAlways")
        )
      )
    )
  );
}
function ie() {
  var P, T, x;
  const t = S((P = o.useLocale) == null ? void 0 : P.call(o)), n = (T = o.useCurrentSession) == null ? void 0 : T.call(o), s = (n == null ? void 0 : n.id) ?? ((x = o.getCurrentSessionId) == null ? void 0 : x.call(o)) ?? null, [r, l] = e.useState(null), [u, v] = e.useState([]), [C, p] = e.useState(!0), [y, g] = e.useState(!1), [f, E] = e.useState(!0), [N, A] = e.useState(null), w = e.useCallback(async () => {
    E(!0);
    try {
      const [i, c] = await Promise.all([
        h("/computer-use/status"),
        h("/computer-use/access")
      ]);
      l(i), v(c.access || []), p(i.enabled !== !1);
    } catch (i) {
      m.error(
        i instanceof Error ? i.message : a(t, "failed")
      );
    } finally {
      E(!1);
    }
  }, [t]);
  e.useEffect(() => {
    w();
  }, [w]);
  const $ = async (i) => {
    A(`revoke:${i.canonical_app_id}`);
    try {
      await h("/computer-use/access", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canonical_app_id: i.canonical_app_id })
      }), await w();
    } catch (c) {
      m.error(
        c instanceof Error ? c.message : a(t, "failed")
      );
    } finally {
      A(null);
    }
  }, W = async (i) => {
    g(!0);
    try {
      await h("/computer-use/feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: i, session_id: s })
      }), p(i), m.success(a(t, i ? "enabledMsg" : "disabledMsg")), await w();
    } catch (c) {
      m.error(
        c instanceof Error ? c.message : a(t, "failed")
      );
    } finally {
      g(!1);
    }
  }, j = [
    {
      title: a(t, "application"),
      dataIndex: "display_name",
      key: "display_name",
      render: (i) => e.createElement(d, { strong: !0 }, i)
    },
    {
      title: a(t, "applicationId"),
      dataIndex: "canonical_app_id",
      key: "canonical_app_id",
      render: (i) => e.createElement(d, { code: !0 }, i)
    },
    {
      key: "actions",
      width: 56,
      render: (i, c) => e.createElement(
        F,
        {
          title: a(t, "revokeConfirm"),
          onConfirm: () => void $(c)
        },
        e.createElement(
          R,
          { title: a(t, "revoke") },
          e.createElement(b, {
            type: "text",
            danger: !0,
            shape: "circle",
            icon: e.createElement(Z),
            loading: N === `revoke:${c.canonical_app_id}`,
            "aria-label": a(t, "revoke")
          })
        )
      )
    }
  ], _ = (r == null ? void 0 : r.runtime_available) === !0;
  return e.createElement(
    "main",
    {
      style: {
        maxWidth: 1080,
        margin: "24px auto",
        padding: "0 24px 40px",
        display: "grid",
        gap: 28
      }
    },
    e.createElement(
      "header",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)"
        }
      },
      e.createElement(
        "div",
        { style: { display: "grid", gap: 6 } },
        e.createElement(
          k,
          { align: "baseline", size: 8 },
          e.createElement(
            te,
            { level: 3, style: { margin: 0 } },
            a(t, "title")
          ),
          e.createElement(
            d,
            { type: "secondary", style: { fontSize: 12 } },
            `${a(t, "version")} ${B.version}`
          )
        ),
        e.createElement(J, {
          status: _ ? "success" : "error",
          text: a(t, _ ? "ready" : "unavailable")
        })
      ),
      e.createElement(
        k,
        { size: 8 },
        e.createElement(
          R,
          { title: a(t, "refresh") },
          e.createElement(b, {
            type: "text",
            shape: "circle",
            icon: e.createElement(Y),
            loading: f,
            onClick: () => void w(),
            "aria-label": a(t, "refresh")
          })
        ),
        e.createElement(
          k,
          { size: 8, align: "center" },
          e.createElement(
            d,
            { type: "secondary", style: { fontSize: 13 } },
            a(t, "feature")
          ),
          e.createElement(Q, {
            checked: C,
            loading: y,
            disabled: !_,
            onChange: (i) => void W(i),
            "aria-label": a(t, "feature")
          })
        )
      )
    ),
    e.createElement(K, {
      defaultActiveKey: "access",
      items: [
        {
          key: "access",
          label: a(t, "accessManagement"),
          children: e.createElement(H, {
            rowKey: "canonical_app_id",
            columns: j,
            dataSource: u,
            pagination: !1,
            size: "middle",
            locale: {
              emptyText: e.createElement(M, {
                image: M.PRESENTED_IMAGE_SIMPLE,
                description: a(t, "empty")
              })
            }
          })
        }
      ]
    })
  );
}
var L;
(L = window.QwenPaw.chat) == null || L.approval.render(
  "computer-use",
  "computer_use_app_access",
  oe
);
var O, U;
(U = (O = window.QwenPaw).registerRoutes) == null || U.call(O, "computer-use", [
  {
    path: "/plugin/computer-use",
    component: ie,
    label: a(ae(), "routeLabel"),
    icon: /* @__PURE__ */ e.createElement(D, null),
    priority: 43
  }
]);
